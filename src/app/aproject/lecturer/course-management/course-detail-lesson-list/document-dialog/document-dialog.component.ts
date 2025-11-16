import { CommonModule } from "@angular/common";
import { Component, inject, Inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatTooltipModule } from "@angular/material/tooltip";
import { DocumentModel } from "../../../../../models/document.models";
import { ApiDocumentServices } from "../../../../../services/document.service";
import { ConfirmDialogComponent } from "../../../../../common/confirm-dialog/confirm-dialog.component";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
    selector: 'document-dialog',
    templateUrl: './document-dialog.component.html',
    styleUrls: ['./document-dialog.component.scss'],
    imports: [CommonModule, MatButtonModule, MatIcon, MatFormFieldModule, MatInputModule, FormsModule, MatDialogModule, MatDividerModule, MatTooltipModule]
})
export class DocumentDialog {
    documents: DocumentModel[] = [];

    filteredDocuments: DocumentModel[] = [...this.documents];
    selectedFiles: File[] = [];
    searchTerm = '';
    isDragOver = false;
    isUploading = false;

    constructor(
        public dialogRef: MatDialogRef<DocumentDialog>,
        @Inject(MAT_DIALOG_DATA) public data: { courseId: number | string },
        private documentService: ApiDocumentServices,
        private dialog: MatDialog,
        private snack: MatSnackBar
    ) {
    }

    ngOnInit() {
      this.getDocuments();
    }

    getDocuments() {
      this.documentService.getDocuments(this.data.courseId).subscribe({
        next: (documents: DocumentModel[]) => {
          console.log(documents);
          this.documents = documents;
          this.filterDocuments();
        }
      });
    }

    onDragOver(event: DragEvent) {
      event.preventDefault();
      this.isDragOver = true;
    }

    onDragLeave(event: DragEvent) {
      event.preventDefault();
      this.isDragOver = false;
    }

    onDrop(event: DragEvent) {
      event.preventDefault();
      this.isDragOver = false;
      
      const files = Array.from(event.dataTransfer?.files || []) as File[];
      this.handleFiles(files);
    }

    onFileSelect(event: any) {
      const files = Array.from(event.target.files || []) as File[];
      this.handleFiles(files);
    }

    private handleFiles(files: File[]) {
      const validTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.xlsx', '.xls'];
      const validFiles = files.filter(file => {
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        return validTypes.includes(extension);
      });

      this.selectedFiles.push(...validFiles);
    }

    removeSelectedFile(index: number) {
      this.selectedFiles.splice(index, 1);
    }

    clearSelectedFiles() {
      if (this.selectedFiles.length === 0) return;

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '420px',
        data: {
          type: 'confirm',
          title: 'Clear Selected Files',
          message: `Are you sure you want to clear ${this.selectedFiles.length} selected file(s)?`,
          confirmText: 'Clear',
          cancelText: 'Cancel'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.selectedFiles = [];
        }
      });
    }

    uploadFiles() {
      if (this.selectedFiles.length === 0) return;
      console.log(this.selectedFiles);
      
      this.isUploading = true;
      
      this.documentService.uploadDocument(this.data.courseId, this.selectedFiles).subscribe({
        next: (document: DocumentModel) => {
          this.documents.unshift(document);
          this.filterDocuments();
          this.selectedFiles = [];
          this.isUploading = false;
          
          this.snack.open('Document uploaded successfully', '', {
            duration: 3000,
            panelClass: ['success-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        },
        error: (error: any) => {
          this.isUploading = false;
          
          this.snack.open('Failed to upload document(s)', '', {
            duration: 3000,
            panelClass: ['error-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        }
      });
    }

    deleteDocument(doc: DocumentModel) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '420px',
        data: {
          type: 'warning',
          title: 'Delete Document',
          message: `Are you sure you want to delete "${doc.fileName}"? This action cannot be undone.`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
          destructive: true
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Call API to delete document
          this.documentService.deleteDocument(doc.documentId).subscribe({
            next: () => {
              this.documents = this.documents.filter(d => d.documentId !== doc.documentId);
              this.filterDocuments();
              this.snack.open('Document deleted successfully', '', {
                duration: 3000,
                panelClass: ['success-snackbar', 'custom-snackbar'],
                horizontalPosition: 'right',
                verticalPosition: 'top'
              });
            },
            error: (error) => {
              this.snack.open('Failed to delete document', '', {
                duration: 3000,
                panelClass: ['error-snackbar', 'custom-snackbar'],
                horizontalPosition: 'right',
                verticalPosition: 'top'
              });
            }
          });
        }
      });
    }

    downloadDocument(doc: DocumentModel) {
      // Simulate download
      const url = doc.fileUrl;
      window.open(url, '_blank');
    }

    filterDocuments() {
      if (!this.searchTerm.trim()) {
        this.filteredDocuments = [...this.documents];
      } else {
        this.filteredDocuments = this.documents.filter(doc =>
          doc.fileName?.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
      }
    }

    getFileType(fileName: string): string {
      const extension = fileName.split('.').pop()?.toLowerCase();
      switch (extension) {
        case 'pdf': return 'pdf';
        case 'doc':
        case 'docx': return 'doc';
        case 'xls':
        case 'xlsx': return 'excel';
        case 'ppt':
        case 'pptx': return 'ppt';
        default: return 'file';
      }
    }

    formatFileSize(bytes: number): string {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    close() {
        this.dialogRef.close();
    }
}