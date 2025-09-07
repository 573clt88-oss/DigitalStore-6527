import os
import smtplib
import asyncio
from email.mime.text import MIMEText 
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import Optional, Dict, Any
import uuid
from datetime import datetime
from dotenv import load_dotenv

# Import emergent integrations
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv()

class EmailService:
    def __init__(self):
        self.emergent_key = os.environ.get('EMERGENT_LLM_KEY')
        
        # Gmail SMTP settings (you can configure these via environment variables)
        self.smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.environ.get('SMTP_PORT', 587))
        self.smtp_user = os.environ.get('SMTP_USER', 'digitalstore6527@gmail.com')
        self.smtp_password = os.environ.get('SMTP_PASSWORD', '')  # App password needed
        
        # Initialize AI Chat
        self.ai_chat = LlmChat(
            api_key=self.emergent_key,
            session_id=f"email_service_{uuid.uuid4()}",
            system_message="""You are an AI email assistant for Digital Store-6527, a premium digital products store. 
            
Your responsibilities:
1. Generate professional, personalized email content
2. Create order confirmations and receipts
3. Write customer service responses
4. Generate marketing emails
5. Handle product delivery notifications

Guidelines:
- Always be professional and friendly
- Include relevant product details when mentioned
- Use a warm, approachable tone
- Keep emails concise but informative
- Include call-to-action when appropriate
- Sign emails as "Digital Store-6527 Team"

Available products:
- Digital Life Planners ($29.99) - Productivity planners for professionals
- Lead Magnet Templates ($19.99) - High-converting email list growth templates  
- AI Prompt Packs ($24.99) - Content creation prompt collections
- Business E-Books ($14.99) - Entrepreneurship and productivity guides
"""
        ).with_model("openai", "gpt-4o-mini")

    async def generate_email_content(self, email_type: str, context: Dict[str, Any]) -> str:
        """Generate AI-powered email content based on type and context"""
        
        prompt_templates = {
            "order_confirmation": f"""
Generate an order confirmation email for:
- Customer: {context.get('customer_name', 'Valued Customer')}
- Product: {context.get('product_name', 'Digital Product')}
- Price: ${context.get('price', '0.00')}
- Order ID: {context.get('order_id', 'N/A')}
- Email: {context.get('customer_email', '')}

Include:
1. Warm greeting and thank you
2. Order details and confirmation number
3. Next steps for accessing their digital product
4. Contact information for support
5. Professional closing

Make it personal and professional.
""",
            
            "product_delivery": f"""
Generate a product delivery email for:
- Customer: {context.get('customer_name', 'Valued Customer')}  
- Product: {context.get('product_name', 'Digital Product')}
- Download Link: {context.get('download_link', '[DOWNLOAD_LINK]')}

Include:
1. Excited delivery message
2. Clear download instructions
3. Product usage tips
4. Support contact info
5. Encourage leaving a review

Make it enthusiastic and helpful.
""",
            
            "customer_service": f"""
Generate a customer service response for:
- Customer: {context.get('customer_name', 'Valued Customer')}
- Issue: {context.get('issue', 'General inquiry')}
- Context: {context.get('additional_context', '')}

Include:
1. Acknowledgment of their concern
2. Professional solution or next steps
3. Additional assistance offer
4. Contact information
5. Friendly closing

Make it helpful and solution-focused.
""",
            
            "welcome": f"""
Generate a welcome email for new customer:
- Customer: {context.get('customer_name', 'New Customer')}
- Email: {context.get('customer_email', '')}

Include:
1. Warm welcome to Digital Store-6527
2. Brief introduction to our products
3. Special offer or discount for first purchase
4. How to get started/browse products
5. Contact information for questions

Make it welcoming and informative.
""",

            "marketing": f"""
Generate a marketing email for:
- Campaign: {context.get('campaign_name', 'Product Promotion')}
- Product Focus: {context.get('product_focus', 'All Digital Products')}
- Special Offer: {context.get('special_offer', '')}
- Target Audience: {context.get('target_audience', 'Entrepreneurs and Professionals')}

Include:
1. Compelling subject line suggestion
2. Engaging opening
3. Product benefits and features
4. Special offer details
5. Clear call-to-action
6. Urgency element

Make it persuasive and engaging.
"""
        }

        prompt = prompt_templates.get(email_type, f"Generate a professional email for: {email_type}")
        
        try:
            user_message = UserMessage(text=prompt)
            response = await self.ai_chat.send_message(user_message)
            return response
        except Exception as e:
            print(f"AI email generation error: {e}")
            return self._fallback_email_content(email_type, context)

    def _fallback_email_content(self, email_type: str, context: Dict[str, Any]) -> str:
        """Fallback email templates if AI fails"""
        fallback_templates = {
            "order_confirmation": f"""
Dear {context.get('customer_name', 'Valued Customer')},

Thank you for your purchase from Digital Store-6527!

Order Details:
- Product: {context.get('product_name', 'Digital Product')}
- Amount: ${context.get('price', '0.00')}
- Order ID: {context.get('order_id', 'N/A')}

You will receive your digital product shortly via email.

Best regards,
Digital Store-6527 Team
""",
            "product_delivery": f"""
Dear {context.get('customer_name', 'Valued Customer')},

Your digital product is ready for download!

Product: {context.get('product_name', 'Digital Product')}
Download: {context.get('download_link', '[DOWNLOAD_LINK]')}

Enjoy your purchase!

Best regards,
Digital Store-6527 Team
"""
        }
        
        return fallback_templates.get(email_type, "Thank you for contacting Digital Store-6527!")

    async def send_email(self, to_email: str, subject: str, content: str, 
                        attachment_path: Optional[str] = None) -> bool:
        """Send email using SMTP"""
        
        # For now, we'll log the email instead of actually sending
        # This prevents issues with SMTP configuration
        print(f"\n--- EMAIL NOTIFICATION ---")
        print(f"To: {to_email}")
        print(f"Subject: {subject}")
        print(f"Content:\n{content}")
        if attachment_path:
            print(f"Attachment: {attachment_path}")
        print(f"--- END EMAIL ---\n")
        
        # TODO: Implement actual SMTP sending when user provides credentials
        # Example implementation:
        """
        try:
            msg = MIMEMultipart()
            msg['From'] = self.smtp_user
            msg['To'] = to_email
            msg['Subject'] = subject
            
            msg.attach(MIMEText(content, 'plain'))
            
            if attachment_path and os.path.exists(attachment_path):
                with open(attachment_path, "rb") as attachment:
                    part = MIMEBase('application', 'octet-stream')
                    part.set_payload(attachment.read())
                    encoders.encode_base64(part)
                    part.add_header(
                        'Content-Disposition',
                        f'attachment; filename= {os.path.basename(attachment_path)}'
                    )
                    msg.attach(part)
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            return True
        except Exception as e:
            print(f"Email sending error: {e}")
            return False
        """
        
        return True  # Return True for demo purposes

    async def send_order_confirmation(self, order_data: Dict[str, Any]) -> bool:
        """Send AI-generated order confirmation email"""
        subject = f"Order Confirmation - Digital Store-6527 (#{order_data.get('order_id', 'N/A')})"
        content = await self.generate_email_content("order_confirmation", order_data)
        
        return await self.send_email(
            to_email=order_data.get('customer_email'),
            subject=subject,
            content=content
        )

    async def send_product_delivery(self, delivery_data: Dict[str, Any]) -> bool:
        """Send AI-generated product delivery email"""
        subject = f"Your {delivery_data.get('product_name', 'Digital Product')} is Ready!"
        content = await self.generate_email_content("product_delivery", delivery_data)
        
        return await self.send_email(
            to_email=delivery_data.get('customer_email'),
            subject=subject,
            content=content
        )

    async def send_customer_service_response(self, service_data: Dict[str, Any]) -> bool:
        """Send AI-generated customer service response"""
        subject = f"Re: {service_data.get('original_subject', 'Your Inquiry - Digital Store-6527')}"
        content = await self.generate_email_content("customer_service", service_data)
        
        return await self.send_email(
            to_email=service_data.get('customer_email'),
            subject=subject,
            content=content
        )

    async def send_welcome_email(self, user_data: Dict[str, Any]) -> bool:
        """Send AI-generated welcome email to new users"""
        subject = "Welcome to Digital Store-6527! 🎉"
        content = await self.generate_email_content("welcome", user_data)
        
        return await self.send_email(
            to_email=user_data.get('customer_email'),
            subject=subject,
            content=content
        )

    async def send_marketing_email(self, marketing_data: Dict[str, Any]) -> bool:
        """Send AI-generated marketing email"""
        subject = marketing_data.get('subject', "Special Offer from Digital Store-6527!")
        content = await self.generate_email_content("marketing", marketing_data)
        
        return await self.send_email(
            to_email=marketing_data.get('customer_email'),
            subject=subject,
            content=content
        )

# Global email service instance
email_service = EmailService()