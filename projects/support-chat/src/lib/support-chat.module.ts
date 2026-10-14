import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SupportChatComponent } from './components/support-chat.component';

@NgModule({ imports: [CommonModule, HttpClientModule, FormsModule, SupportChatComponent], exports: [SupportChatComponent] })
export class SupportChatModule {}
