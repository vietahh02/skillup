import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { ChatMessage, ConversationModel } from '../../models/ai.models';
import { ApiAiServices } from '../../services/ai.service';
import { UserInfo } from '../../models/user.models';
import { AuthService } from '../../context/auth.service';

@Component({
  selector: 'app-chat-box',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatBadgeModule
  ],
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss']
})
export class ChatBoxComponent implements OnInit, AfterViewChecked {
  private apiAiServices = inject(ApiAiServices);
  private authService = inject(AuthService);
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  isExpanded = false;
  isMinimized = true;
  newMessage = '';
  messages: ChatMessage[] = [];
  isTyping = false;
  unreadCount = 0;
  currentUser: UserInfo | null = null;

  ngOnInit(): void {
    // Initialize with welcome message
    this.currentUser = this.authService.getCurrentUser();
    this.addBotMessage('Xin chào! Tôi là trợ lý ảo của SkillUp. Tôi có thể giúp gì cho bạn hôm nay?');
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  toggleChat(): void {
    if (this.isMinimized) {
      this.isMinimized = false;
      this.isExpanded = true;
      this.unreadCount = 0;
    } else {
      this.isExpanded = !this.isExpanded;
      if (this.isExpanded) {
        this.unreadCount = 0;
      }
    }
  }

  minimizeChat(): void {
    this.isExpanded = false;
    this.isMinimized = true;
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: this.generateId(),
      text: this.newMessage.trim(),
      isBot: false,
      timestamp: new Date()
    };

    this.messages.push(userMessage);
    this.newMessage = '';

    // Show bot typing indicator
    this.showTypingIndicator();

    this.hideTypingIndicator();
    this.getBotResponse(userMessage.text);
  }

  private addBotMessage(text: string, timestamp: Date = new Date()): void {
    const botMessage: ChatMessage = {
      id: this.generateId(),
      text: text,
      isBot: true,
      timestamp: timestamp
    };

    this.messages.push(botMessage);

    // Increment unread count if chat is minimized
    if (this.isMinimized) {
      this.unreadCount++;
    }
  }

  private showTypingIndicator(): void {
    this.isTyping = true;
    const typingMessage: ChatMessage = {
      id: 'typing',
      text: '',
      isBot: true,
      timestamp: new Date(),
      typing: true
    };
    this.messages.push(typingMessage);
  }

  private hideTypingIndicator(): void {
    this.isTyping = false;
    this.messages = this.messages.filter(msg => msg.id !== 'typing');
  }

  private getBotResponse(message: string) {
    const payload: ConversationModel = {
      message: message.trim(),
      conversationHistory: this.messages.map((message) => ({
        role: message.isBot ? 'assistant' : 'user',
        content: message.text
      }))
    };
    this.apiAiServices.getAiChat(payload).subscribe((response) => {
      this.addBotMessage(response.response, new Date(response.timestamp));
    }, error => {
      console.error('Error getting bot response:', error);
      this.addBotMessage('Xin lỗi, tôi không thể trả lời câu hỏi của bạn.', new Date());
    });
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = 
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  formatTime(timestamp: Date): string {
    return timestamp.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
