import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  MessageCircle,
  Heart
} from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';

const ContactPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'support@addistesfa.org',
      description: 'We reply within 24 hours',
    },
    {
      icon: Phone,
      label: 'Crisis Line',
      value: '911 (Emergency)',
      description: 'Available 24/7',
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'Addis Ababa, Ethiopia',
      description: 'Serving globally online',
    },
    {
      icon: Clock,
      label: 'Hours',
      value: '24/7 Online',
      description: 'Always here for you',
    },
  ];

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Thank You!</h2>
        <p className="text-slate-600 mb-8">
          Your message has been received. Our team will get back to you within 24 hours.
        </p>
        <Button onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contact Us</h1>
          <p className="text-sm text-slate-600">
            We're here to help. Reach out anytime.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Contact Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Send us a Message</h2>
              <p className="text-sm text-slate-500">We typically reply within 24 hours</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Subject"
              placeholder="How can we help?"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Message
              </label>
              <textarea
                placeholder="Tell us more about your inquiry..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
              />
            </div>
            <Button 
              type="submit" 
              isLoading={isLoading}
              leftIcon={<Send className="w-4 h-4" />}
              className="w-full"
            >
              Send Message
            </Button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          {contactInfo.map((info) => (
            <div 
              key={info.label}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <info.icon className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{info.label}</p>
                <p className="font-semibold text-slate-900">{info.value}</p>
                <p className="text-sm text-slate-500">{info.description}</p>
              </div>
            </div>
          ))}

          {/* Crisis Banner */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <h3 className="font-semibold text-red-700 mb-2">Crisis Support</h3>
            <p className="text-sm text-red-600 mb-3">
              If you or someone you know is in immediate danger, please contact emergency services.
            </p>
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                Emergency: 911
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                Crisis Text: Text HOME to 741741
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
