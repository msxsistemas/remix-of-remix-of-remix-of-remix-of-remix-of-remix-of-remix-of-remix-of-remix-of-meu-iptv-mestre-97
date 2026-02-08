import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, Phone, Gift, Loader2, Sparkles, Check } from 'lucide-react';
import logoPlay from '@/assets/logo-play.png';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get referral code from URL
  const referralCode = searchParams.get('ref') || '';

  useEffect(() => {
    document.title = activeTab === 'signin' ? 'Entrar | Msx Gestor' : 'Cadastro | Msx Gestor';
  }, [activeTab]);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type === 'recovery') {
      setIsRecovery(true);
      return;
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        navigate('/');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      } else if (session?.user && !isRecovery) {
        setUser(session.user);
        navigate('/');
      } else if (!session) {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, isRecovery]);

  // If there's a referral code, default to signup tab
  useEffect(() => {
    if (referralCode) {
      setActiveTab('signup');
    }
  }, [referralCode]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('signup-name') as string;
    const email = formData.get('signup-email') as string;
    const whatsapp = formData.get('signup-whatsapp') as string;
    const password = formData.get('signup-password') as string;
    const confirmPassword = formData.get('confirm-password') as string;
    const refCode = formData.get('referral-code') as string;

    if (!name.trim()) {
      toast.error('Por favor, informe seu nome');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: name.trim(),
            whatsapp: whatsapp?.trim() || null,
            referral_code: refCode?.trim() || null,
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Este email já está cadastrado. Tente fazer login.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Conta criada com sucesso! Verifique seu email para confirmar.');
      }
    } catch (error) {
      toast.error('Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('signin-email') as string;
    const password = formData.get('signin-password') as string;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email ou senha incorretos');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Login realizado com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetLoading(true);

    if (!resetEmail.trim()) {
      toast.error('Por favor, informe seu email');
      setResetLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
        setResetDialogOpen(false);
        setResetEmail('');
      }
    } catch (error) {
      toast.error('Erro ao enviar email de recuperação');
    } finally {
      setResetLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!newPassword.trim()) {
      toast.error('Por favor, informe a nova senha');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        let errorMessage = error.message;
        if (error.message.includes('New password should be different from the old password')) {
          errorMessage = 'A nova senha deve ser diferente da senha anterior';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'A senha deve ter pelo menos 6 caracteres';
        }
        toast.error(errorMessage);
      } else {
        toast.success('Senha atualizada com sucesso!');
        setIsRecovery(false);
        setNewPassword('');
        setConfirmNewPassword('');
        navigate('/');
      }
    } catch (error) {
      toast.error('Erro ao atualizar senha');
    } finally {
      setLoading(false);
    }
  };

  // Password recovery form
  if (isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="w-full max-w-md relative z-10">
          <div className="bg-[#12122a]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden shadow-lg shadow-primary/20">
                <img src={logoPlay} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-2xl font-bold text-white">Redefinir Senha</h1>
              <p className="text-gray-400 text-sm mt-1">Digite sua nova senha abaixo</p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-gray-300 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-500" />
                  Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-12 bg-[#1a1a2e] border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password" className="text-gray-300 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-500" />
                  Confirmar Nova Senha
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-new-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirme sua nova senha"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="h-12 bg-[#1a1a2e] border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-base bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Atualizar Senha
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a1a] p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.15),transparent_50%)]" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Main Card */}
        <div className="bg-[#12122a]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8">
            {activeTab === 'signin' ? (
              <>
                {/* Login Header */}
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-white mb-2">Acesse sua conta</h1>
                  <p className="text-gray-400 text-sm">Bem-vindo de volta! Insira suas credenciais.</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-gray-300 flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-blue-400" />
                      E-mail
                    </Label>
                    <Input
                      id="signin-email"
                      name="signin-email"
                      type="email"
                      placeholder="seu@email.com"
                      className="h-12 bg-[#1a1a2e] border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-gray-300 flex items-center gap-2 text-sm">
                      <Lock className="h-4 w-4 text-amber-500" />
                      Senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        name="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="h-12 bg-[#1a1a2e] border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember me & Forgot password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="remember-me" 
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label htmlFor="remember-me" className="text-sm text-gray-400 cursor-pointer">
                        Lembrar-me
                      </label>
                    </div>
                    <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                      <DialogTrigger asChild>
                        <button type="button" className="text-sm text-primary hover:text-primary/80 transition-colors">
                          Esqueceu a senha?
                        </button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#12122a] border-white/10">
                        <DialogHeader>
                          <DialogTitle className="text-white">Recuperar senha</DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Digite seu email para receber o link de recuperação.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handlePasswordReset} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="reset-email" className="text-gray-300">Email</Label>
                            <Input
                              id="reset-email"
                              type="email"
                              placeholder="seu@email.com"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              className="h-12 bg-[#1a1a2e] border-white/10 text-white placeholder:text-gray-500"
                              required
                            />
                          </div>
                          <Button 
                            type="submit" 
                            className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700" 
                            disabled={resetLoading}
                          >
                            {resetLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enviando...
                              </>
                            ) : (
                              'Enviar link'
                            )}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium shadow-lg shadow-purple-500/25" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Entrar na plataforma
                      </>
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-[#12122a] px-4 text-sm text-gray-500">OU</span>
                  </div>
                </div>

                {/* Sign up link */}
                <p className="text-center text-gray-400 text-sm">
                  Ainda não tem conta?{' '}
                  <button 
                    type="button"
                    onClick={() => setActiveTab('signup')}
                    className="text-primary font-medium hover:text-primary/80 transition-colors"
                  >
                    Criar conta gratuita
                  </button>
                </p>
              </>
            ) : (
              <>
                {/* Signup Header */}
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-white mb-2">Criar sua conta</h1>
                  <p className="text-gray-400 text-sm">Preencha os dados para começar</p>
                </div>

                {/* Signup Form */}
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-gray-300 flex items-center gap-2 text-sm">
                      <UserIcon className="h-4 w-4 text-green-400" />
                      Nome completo
                    </Label>
                    <Input
                      id="signup-name"
                      name="signup-name"
                      type="text"
                      placeholder="Seu nome completo"
                      className="h-12 bg-[#1a1a2e] border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-gray-300 flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-blue-400" />
                      E-mail
                    </Label>
                    <Input
                      id="signup-email"
                      name="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      className="h-12 bg-[#1a1a2e] border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-whatsapp" className="text-gray-300 flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-emerald-400" />
                      WhatsApp <span className="text-gray-500 text-xs">(opcional)</span>
                    </Label>
                    <Input
                      id="signup-whatsapp"
                      name="signup-whatsapp"
                      type="tel"
                      placeholder="11999999999"
                      className="h-12 bg-[#1a1a2e] border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-gray-300 flex items-center gap-2 text-sm">
                        <Lock className="h-4 w-4 text-amber-500" />
                        Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          name="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Mínimo 6"
                          className="h-12 bg-[#1a1a2e] border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-gray-300 text-sm">
                        Confirmar
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          name="confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirme"
                          className="h-12 bg-[#1a1a2e] border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Referral Code Field */}
                  <div className="space-y-2">
                    <Label htmlFor="referral-code" className="text-gray-300 flex items-center gap-2 text-sm">
                      <Gift className="h-4 w-4 text-pink-400" />
                      Código de indicação <span className="text-gray-500 text-xs">(opcional)</span>
                    </Label>
                    <Input
                      id="referral-code"
                      name="referral-code"
                      type="text"
                      placeholder="REF_XXXXXXXX"
                      defaultValue={referralCode}
                      className="h-12 bg-[#1a1a2e] border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 font-mono"
                    />
                    {referralCode && (
                      <p className="text-xs text-primary flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Código de indicação aplicado!
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium shadow-lg shadow-purple-500/25" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Criar conta
                      </>
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-[#12122a] px-4 text-sm text-gray-500">OU</span>
                  </div>
                </div>

                {/* Login link */}
                <p className="text-center text-gray-400 text-sm">
                  Já tem uma conta?{' '}
                  <button 
                    type="button"
                    onClick={() => setActiveTab('signin')}
                    className="text-primary font-medium hover:text-primary/80 transition-colors"
                  >
                    Fazer login
                  </button>
                </p>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center space-y-3">
          <div className="flex items-center justify-center gap-3 text-sm">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Termos de Serviço
            </a>
            <span className="text-gray-600">•</span>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Política de Privacidade
            </a>
          </div>
          <p className="text-gray-500 text-xs">
            {new Date().getFullYear()}© Todos os direitos reservados Msx Gestor
          </p>
        </div>
      </div>
    </div>
  );
}
