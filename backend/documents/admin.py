from django.contrib import admin
from .models import Document, DocumentChunk

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'document_type', 'processed', 'uploaded_at', 'page_count')
    list_filter = ('document_type', 'processed', 'uploaded_at')
    search_fields = ('title', 'user__username')
    readonly_fields = ('uploaded_at', 'file_size', 'page_count')

@admin.register(DocumentChunk)
class DocumentChunkAdmin(admin.ModelAdmin):
    list_display = ('document', 'chunk_index', 'page_number')
    list_filter = ('document', 'page_number')
    search_fields = ('content', 'document__title')