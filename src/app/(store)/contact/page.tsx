'use client';

import React, { useState } from 'react';
import { 
  MessageSquare, Mail, Phone, MapPin, Clock, 
  Send, CheckCircle2, ShieldCheck 
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="contact-page">
      <PageHeader 
        title="Contact Customer Support"
        subtitle="Have a question about an order, delivery status, or product specifications? We're here to help."
        breadcrumbs={[{ label: 'Contact Us' }]}
      />

      <div className="container" style={{ padding: '40px 24px 80px' }}>
        <div className="contact-layout-clean">
          
          {/* Left Column: Direct Channels */}
          <div className="contact-channels-col">
            
            {/* WhatsApp Quick Connect */}
            <div className="whatsapp-callout-clean">
              <div className="whatsapp-callout-header">
                <MessageSquare size={22} />
                <h3>WhatsApp Fast Support</h3>
              </div>
              <p>
                For immediate assistance regarding ongoing deliveries, instant EFT confirmations, or product questions:
              </p>
              <a
                href="https://wa.me/27821234567?text=Hi%20Vybetek%20Store%20Support%2C%20I%20have%20an%20inquiry"
                target="_blank"
                rel="noreferrer"
                className="whatsapp-btn-clean"
              >
                <MessageSquare size={17} /> Open WhatsApp Chat
              </a>
            </div>

            {/* Direct Details List */}
            <div className="contact-info-list-clean">
              <h3>Support Channels</h3>

              <div className="contact-info-item">
                <div className="info-icon-box">
                  <Mail size={18} />
                </div>
                <div>
                  <span className="info-label">Email Inquiries</span>
                  <a href="mailto:support@vylex.co.za" className="info-val-link">
                    support@vylex.co.za
                  </a>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="info-icon-box">
                  <Phone size={18} />
                </div>
                <div>
                  <span className="info-label">Phone Support</span>
                  <span className="info-val-text">+27 (0) 82 123 4567</span>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="info-icon-box">
                  <Clock size={18} />
                </div>
                <div>
                  <span className="info-label">Operating Hours</span>
                  <span className="info-val-text">
                    Mon – Fri: 08:30 – 17:00<br />
                    Sat: 09:00 – 13:00
                  </span>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="info-icon-box">
                  <MapPin size={18} />
                </div>
                <div>
                  <span className="info-label">Dispatch Center</span>
                  <span className="info-val-text">
                    Sandton / Johannesburg, Gauteng, South Africa
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Inquiry Form */}
          <div className="contact-form-col">
            <div className="contact-form-container">
              {formSubmitted ? (
                <div className="form-success-state">
                  <div className="success-icon-circle">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3>Inquiry Received!</h3>
                  <p>
                    Thank you, <strong>{formData.name}</strong>. Our customer care team will review your message and respond to <strong>{formData.email}</strong> within 1–2 business hours.
                  </p>
                  <button 
                    onClick={() => {
                      setFormSubmitted(false);
                      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
                    }}
                    className="btn btn-outline"
                    style={{ marginTop: '16px' }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="clean-form">
                  <div className="form-heading">
                    <h3>Send a Message</h3>
                    <p>Fill out the form below and we will respond promptly.</p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Kagiso Motsepe" 
                      className="form-input" 
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="kagiso@example.co.za" 
                        className="form-input" 
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone / WhatsApp</label>
                      <input 
                        type="tel" 
                        placeholder="082 123 4567" 
                        className="form-input" 
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Order Tracking or Product Specification" 
                      className="form-input" 
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message *</label>
                    <textarea 
                      rows={4}
                      required 
                      placeholder="How can we assist you today?" 
                      className="form-input" 
                      style={{ resize: 'vertical', minHeight: '110px' }}
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '14px', marginTop: '8px' }}
                  >
                    <Send size={16} /> Send Message
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

