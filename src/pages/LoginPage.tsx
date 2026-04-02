import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';

export default function LoginPage() {
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Mock validation
    if ((mobile === '9999999999' && password === 'admin123') || 
        (mobile === '8888888888' && password === 'driver123')) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep('otp');
      }, 1000);
    } else {
      setError('Invalid credentials. Use provided test credentials.');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    
    if (enteredOtp === '123456') {
      const role = mobile === '9999999999' ? 'admin' : 'driver';
      login(mobile, role);
      navigate(role === 'admin' ? '/dashboard' : '/driver');
    } else {
      setError('Invalid OTP. Use 123456.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#111111] flex flex-col items-center justify-center p-4 transition-colors duration-500">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px]"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-black dark:bg-white mb-6">
            <div className="w-6 h-6 border-2 border-white dark:border-black rounded-sm" />
          </div>
          <h1 className="text-3xl font-display font-black tracking-tight text-[#0A0A0A] dark:text-[#F0F0F0] mb-2">FleetTrack</h1>
          <p className="text-[#6B6B6B] dark:text-[#888888] font-body">Professional Fleet Management</p>
        </div>

        <div className="bg-[#F5F5F5] dark:bg-[#1A1A1A] p-8 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2E2E] shadow-sm overflow-hidden relative">
          <AnimatePresence mode="wait">
            {step === 'credentials' ? (
              <motion.form 
                key="credentials"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleCredentialsSubmit}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#6B6B6B] dark:text-[#888888]">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAAAAA] dark:text-[#555555]" />
                      <input 
                        type="text" 
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="9999999999"
                        className="w-full pl-10 pr-4 py-3 bg-[#FFFFFF] dark:bg-[#111111] border border-[#E0E0E0] dark:border-[#2E2E2E] rounded-xl text-[#0A0A0A] dark:text-[#F0F0F0] placeholder-[#AAAAAA] dark:placeholder-[#555555] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#6B6B6B] dark:text-[#888888]">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAAAAA] dark:text-[#555555]" />
                      <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 bg-[#FFFFFF] dark:bg-[#111111] border border-[#E0E0E0] dark:border-[#2E2E2E] rounded-xl text-[#0A0A0A] dark:text-[#F0F0F0] placeholder-[#AAAAAA] dark:placeholder-[#555555] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#1A1A1A] dark:bg-[#F0F0F0] text-white dark:text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing...' : (
                    <>Continue <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleOtpSubmit}
                className="space-y-8 text-center"
              >
                <div className="space-y-2">
                  <h3 className="text-xl font-display font-bold text-[#0A0A0A] dark:text-[#F0F0F0]">Verify Account</h3>
                  <p className="text-[#6B6B6B] dark:text-[#888888] text-sm">We've sent a code to your phone</p>
                </div>

                <div className="flex justify-between gap-2 max-w-[280px] mx-auto">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      className="w-10 h-12 bg-[#FFFFFF] dark:bg-[#111111] border border-[#E0E0E0] dark:border-[#2E2E2E] rounded-lg text-center text-xl font-bold text-[#0A0A0A] dark:text-[#F0F0F0] focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                    />
                  ))}
                </div>

                {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

                <div className="space-y-4">
                  <button 
                    type="submit"
                    className="w-full bg-[#1A1A1A] dark:bg-[#F0F0F0] text-white dark:text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
                  >
                    Verify & Login <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setStep('credentials')}
                    className="text-xs font-bold uppercase tracking-widest text-[#6B6B6B] dark:text-[#888888] hover:text-black dark:hover:text-white transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 text-center space-y-4">
          <p className="text-[#AAAAAA] dark:text-[#555555] text-xs uppercase tracking-widest font-bold">Prototype Credentials</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-[#F5F5F5] dark:bg-[#1A1A1A] rounded-lg border border-[#E0E0E0] dark:border-[#2E2E2E] text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#AAAAAA] dark:text-[#555555] mb-1">Admin</p>
              <p className="text-xs font-body text-[#6B6B6B] dark:text-[#888888]">9999999999</p>
              <p className="text-xs font-body text-[#6B6B6B] dark:text-[#888888]">OTP: 123456</p>
            </div>
            <div className="p-3 bg-[#F5F5F5] dark:bg-[#1A1A1A] rounded-lg border border-[#E0E0E0] dark:border-[#2E2E2E] text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#AAAAAA] dark:text-[#555555] mb-1">Driver</p>
              <p className="text-xs font-body text-[#6B6B6B] dark:text-[#888888]">8888888888</p>
              <p className="text-xs font-body text-[#6B6B6B] dark:text-[#888888]">OTP: 123456</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
