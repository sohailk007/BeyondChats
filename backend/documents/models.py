from django.db import models
from django.contrib.auth import get_user_model
User = get_user_model()

class Document(models.Model):
    DOCUMENT_TYPES = (
        ('ncert', 'NCERT'),
        ('uploaded', 'Uploaded'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=255)
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES, default='uploaded')
    file = models.FileField(upload_to='documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)
    file_size = models.BigIntegerField(default=0)
    page_count = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.title} ({self.user.username})"

class DocumentChunk(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='chunks')
    content = models.TextField()
    chunk_index = models.IntegerField()
    page_number = models.IntegerField()
    embeddings = models.BinaryField(null=True, blank=True)
    
    class Meta:
        unique_together = ['document', 'chunk_index']
        ordering = ['chunk_index']
    
    def __str__(self):
        return f"Chunk {self.chunk_index} of {self.document.title}"