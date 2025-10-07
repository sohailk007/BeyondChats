import os
import tempfile
from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from celery import shared_task
from django.conf import settings
from .models import Document, DocumentChunk
from langchain_community.embeddings import HuggingFaceEmbeddings


@shared_task
def process_pdf(document_id):
    """
    Process PDF document: extract text, split into chunks, and create embeddings
    """
    try:
        document = Document.objects.get(id=document_id)
        
        # Extract text from PDF
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            for chunk in document.file.chunks():
                tmp_file.write(chunk)
            tmp_file_path = tmp_file.name
        
        # Read PDF
        text = ""
        reader = PdfReader(tmp_file_path)
        document.page_count = len(reader.pages)
        
        for page_num, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                text += f"Page {page_num + 1}:\n{page_text}\n\n"
        
        # Clean up temp file
        os.unlink(tmp_file_path)
        
        # Split text into chunks
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len
        )
        
        chunks = splitter.split_text(text)
        
        # Save chunks to database
        for idx, chunk_text in enumerate(chunks):
            DocumentChunk.objects.create(
                document=document,
                content=chunk_text,
                chunk_index=idx,
                page_number=(idx % document.page_count) + 1
            )
        
        # Update document status
        document.processed = True
        document.file_size = document.file.size
        document.save()
        
        # Create FAISS index
        create_faiss_index(document_id)
        
        return f"Successfully processed {document.title} with {len(chunks)} chunks"
        
    except Exception as e:
        document = Document.objects.get(id=document_id)
        document.processed = False
        document.save()
        raise e

def create_faiss_index(document_id):
    """
    Create FAISS vector store for a document
    """
    document = Document.objects.get(id=document_id)
    chunks = DocumentChunk.objects.filter(document=document)
    
    if not chunks:
        return
    
    # Create embeddings
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    
    chunk_texts = [chunk.content for chunk in chunks]
    
    # Create FAISS index
    vector_store = FAISS.from_texts(chunk_texts, embeddings)
    
    # Save index to file
    index_path = os.path.join(settings.MEDIA_ROOT, 'faiss_index', str(document_id))
    os.makedirs(index_path, exist_ok=True)
    vector_store.save_local(index_path)
    
    return index_path

def search_documents(query, documents, k=3):
    """
    Search for relevant chunks in documents
    """
    results = []
    
    for document in documents:
        if not document.processed:
            continue
            
        index_path = os.path.join(settings.MEDIA_ROOT, 'faiss_index', str(document.id))
        if not os.path.exists(index_path):
            continue
        
        # Load FAISS index
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        
        try:
            vector_store = FAISS.load_local(
                index_path, 
                embeddings, 
                allow_dangerous_deserialization=True
            )
            
            # Search for similar chunks
            similar_docs = vector_store.similarity_search(query, k=k)
            
            for doc in similar_docs:
                results.append({
                    'document_id': document.id,
                    'document_title': document.title,
                    'content': doc.page_content,
                    'score': doc.metadata.get('score', 0) if hasattr(doc, 'metadata') else 0
                })
                
        except Exception as e:
            print(f"Error searching document {document.id}: {e}")
            continue
    
    # Sort by relevance score
    results.sort(key=lambda x: x['score'], reverse=True)
    return results[:k]