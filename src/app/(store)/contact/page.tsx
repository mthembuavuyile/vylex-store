'use client';

import React, { useState } from 'react';
import { 
  MessageSquare, Mail, Phone, MapPin, Clock, 
  Send, CheckCircle2, ShieldCheck, HelpCircle 
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
    <div>
      <PageHeader 
        title="Contact & Customer Care"
        subtitle="Have a question about an order, shipping, or product specifications? We're here to assist you."
        badge="South Africa Support"
        breadcrumbs={[{ label: 'Contact Us' }]}
      />

      <div className="container" style={{ padding: '48px 24px 80px' }}>
        <div className="contact-grid">
          
          {/* Left Column: Direct Contact Details & WhatsApp Banner */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* WhatsApp Highlight Box */}
            <div style={{
              background: 'linear-gradient(135deg, #052e16 0%, #14532d 100%)',
              border: '1px solid #16a34a',
              borderRadius: '16px',
              padding: '28px',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(22, 163, 74, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <MessageSquare size={24} style={{ color: '#4ade80' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                  WhatsApp Direct Support
                </h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#dcfce7', lineHeight: 1.5, marginBottom: '20px' }}>
                For the fastest assistance regarding active orders, product inquiries, or bank transfer confirmations, chat with our local team on WhatsApp.
              </p>
              <a
                href="https://wa.me/27821234567?text=Hi%20Vybetek%20Store%20Support%2C%20I%20have%20an%20inquiry"
                target="_blank"
                rel="noreferrer"
                className="btn"
                style={{
                  background: '#22c55e',
                  color: '#ffffff',
                  fontWeight: 700,
                  width: '100%',
                  justifyContent: 'center',
                  padding: '14px',
                  borderRadius: '10px',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <MessageSquare size={18} /> Open WhatsApp Chat
              </a>
            </div>

            {/* General Contact Info Card */}
            <div className="info-box-card">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px', color: 'var(--navy)' }}>
                Direct Channels
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(251, 169, 25, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail size={18} style={{ color: 'var(--orange)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sdark)', textTransform: 'uppercase' }}>Email Address</div>
                    <a href="mailto:support@vylex.co.za" style={{ color: 'var(--navy)', fontWeight: 600, fontSize: '0.95rem' }}>
                      support@vylex.co.za
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(251, 169, 25, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone size={18} style={{ color: 'var(--orange)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sdark)', textTransform: 'uppercase' }}>Telephone & WhatsApp</div>
                    <div style={{ color: 'var(--navy)', fontWeight: 600, fontSize: '0.95rem' }}>
                      +27 (0) 82 123 4567
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(251, 169, 25, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={18} style={{ color: 'var(--orange)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sdark)', textTransform: 'uppercase' }}>Operating Hours</div>
                    <div style={{ color: 'var(--navy)', fontSize: '0.9rem' }}>
                      Monday – Friday: 08:30 – 17:00<br />
                      Saturday: 09:00 – 13:00 (Dispatch on Mon)
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(251, 169, 25, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={18} style={{ color: 'var(--orange)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sdark)', textTransform: 'uppercase' }}>Dispatch Hub</div>
                    <div style={{ color: 'var(--navy)', fontSize: '0.9rem' }}>
                      Sandton / Johannesburg Logistics Center<br />
                      Gauteng, South Africa
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Inquiry Submission Form */}
          <div className="info-box-card">
            {formSubmitted ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--navy)' }}>Inquiry Received!</h3>
                <p style={{ color: 'var(--sdark)', maxWidth: '440px', lineHeight: 1.6 }}>
                  Thank you for reaching out, <strong>{formData.name}</strong>. Our customer care team will review your message and respond to <strong>{formData.email}</strong> within 1–2 business hours.
                </p>
                <button 
                  onClick={() => {
                    setFormSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
                  }}
                  className="btn btn-outline"
                  style={{ marginTop: '12px' }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '6px' }}>
                    Send Us an Inquiry
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--sdark)' }}>
                    Fill in the form below and we will get back to you promptly.
                  </p>
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
                    <label className="form-label">Phone / WhatsApp Number</label>
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
                    placeholder="e.g. Order Tracking or Product Inquiry" 
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
                    style={{ resize: 'vertical', minHeight: '100px' }}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px', marginTop: '12px', gap: '8px' }}
                >
                  <Send size={16} /> Send Message
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
