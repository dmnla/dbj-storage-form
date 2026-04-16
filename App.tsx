import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Bike, 
  Calendar, 
  Check, 
  ChevronLeft, 
  Info,
  Clock
} from 'lucide-react';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { TextArea } from './components/TextArea';
import { submitStorageRequest } from './services/storageService';
import { Step, FormData } from './types';

// Initial state
const initialData: FormData = {
  name: '',
  phone: '',
  bikeModel: '',
  accessories: '',
  startDate: '',
  endDate: '',
  notes: ''
};

const App: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.HERO);
  const [formData, setFormData] = useState<FormData>(initialData);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Helper to calculate duration
  const getDurationString = (start: string, end: string) => {
    if (!start || !end) return null;
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    // Allow same day, but not past date
    if (endDate < startDate) return null;

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    if (diffDays === 0) return "1 Hari"; // Minimum 1 day
    if (diffDays < 30) {
      return `${diffDays} Hari`;
    }
    
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    
    if (days === 0) return `${months} Bulan`;
    return `${months} Bulan ${days} Hari`;
  };

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleNext = () => {
    // Basic validation
    if (step === Step.DETAILS) {
      if (!formData.name.trim() || !formData.phone.trim()) {
        setError("Mohon isi semua data yang wajib.");
        return;
      }
    }
    if (step === Step.BIKE_INFO) {
      if (!formData.bikeModel.trim()) {
        setError("Mohon informasikan tentang sepeda Anda.");
        return;
      }
    }
    
    setError(null);
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep(prev => prev - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Allow only numbers and '+'
      if (value && !/^[0-9+]+$/.test(value)) {
        return; 
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleDateSubmit = () => {
    if (!formData.startDate || !formData.endDate) {
      setError("Mohon pilih tanggal mulai dan selesai.");
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError("Tanggal selesai harus setelah tanggal mulai.");
      return;
    }

    setError(null);
    setIsTermsOpen(true);
  };

  const handleSubmit = async () => {
    if (!agreedToTerms) {
      setError("Anda harus menyetujui Syarat & Ketentuan.");
      return;
    }

    setIsSubmitting(true);
    try {
      const duration = getDurationString(formData.startDate, formData.endDate) || "Unknown";
      await submitStorageRequest(formData, duration);
      setStep(Step.SUCCESS);
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan. Mohon periksa koneksi internet Anda.");
    } finally {
      setIsSubmitting(false);
      setIsTermsOpen(false);
    }
  };

  const resetForm = () => {
    setFormData(initialData);
    setStep(Step.HERO);
    setAgreedToTerms(false);
  };

  // Progress Bar
  const progress = Math.min((step / 3) * 100, 100);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-purple-500/30">
      
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col p-6">
        
        {/* Header (except on Hero/Success) */}
        {step > Step.HERO && step < Step.SUCCESS && (
          <div className="mb-8 pt-4">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={handleBack}
                className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
                Langkah {step} dari 3
              </div>
              <div className="w-8"></div> {/* Spacer for alignment */}
            </div>
            {/* Progress Bar */}
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-600 transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <main className="flex-grow flex flex-col justify-center">
          
          {/* HERO */}
          {step === Step.HERO && (
            <div className="text-center space-y-8 animate-fade-in-up">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-900/40">
                  <Bike className="w-10 h-10 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-3">
                  Daily Bike<br /><span className="text-purple-400">Storage</span>
                </h1>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Layanan penyimpanan sepeda PIK 2
                </p>
              </div>
              <div className="pt-8">
                <Button fullWidth onClick={() => setStep(Step.DETAILS)}>
                  Mulai Registrasi <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 1: DETAILS */}
          {step === Step.DETAILS && (
            <div className="space-y-6 animate-fade-in">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Data Diri</h2>
                <p className="text-slate-400">Kami membutuhkan info kontak untuk tanda terima.</p>
              </div>
              
              <div className="space-y-4">
                <Input 
                  label="Nama Lengkap" 
                  name="name"
                  placeholder="Contoh: Budi Santoso"
                  value={formData.name}
                  onChange={handleInputChange}
                  autoFocus
                />
                <Input 
                  label="Nomor WhatsApp" 
                  name="phone"
                  type="tel"
                  placeholder="Contoh: +628123456789"
                  value={formData.phone}
                  onChange={handleInputChange}
                  inputMode="tel"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
                  <Info className="w-4 h-4" /> {error}
                </div>
              )}

              <Button fullWidth onClick={handleNext} className="mt-6">
                Lanjut
              </Button>
            </div>
          )}

          {/* STEP 2: BIKE INFO */}
          {step === Step.BIKE_INFO && (
            <div className="space-y-6 animate-fade-in">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Sepeda Anda</h2>
                <p className="text-slate-400">Beritahu kami sepeda apa yang akan dititipkan.</p>
              </div>

              <div className="space-y-4">
                <Input 
                  label="Model & Tipe Sepeda" 
                  name="bikeModel"
                  placeholder="Contoh: Brompton C Line, Road Bike Specialized"
                  value={formData.bikeModel}
                  onChange={handleInputChange}
                  autoFocus
                />
                
                {/* Changed to TextArea for longer paragraph input */}
                <TextArea 
                  label="Aksesoris Terpasang" 
                  name="accessories"
                  placeholder="Sebutkan semua aksesoris yang menempel (e.g., Lampu depan, Speedometer, Tas sadel, Holder HP)..."
                  value={formData.accessories}
                  onChange={handleInputChange}
                />
                
                <Input 
                  label="Catatan Khusus (Opsional)" 
                  name="notes"
                  placeholder="Contoh: Lecet di frame kiri, ban belakang kempes"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>

              {error && (
                 <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
                  <Info className="w-4 h-4" /> {error}
                </div>
              )}

              <Button fullWidth onClick={handleNext} className="mt-6">
                Lanjut
              </Button>
            </div>
          )}

          {/* STEP 3: DURATION */}
          {step === Step.DURATION && (
            <div className="space-y-6 animate-fade-in">
              <div className="mb-4">
                <h2 className="text-2xl font-bold mb-2">Periode Penitipan</h2>
                <p className="text-slate-400">Pilih tanggal mulai dan selesai penyimpanan.</p>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 space-y-4">
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400 ml-1">Tanggal Mulai</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors [color-scheme:dark]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400 ml-1">Tanggal Selesai</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>

                {formData.startDate && formData.endDate && (
                  <div className="space-y-3 mt-4">
                     <div className="flex items-center gap-3 p-4 bg-purple-600/10 rounded-xl border border-purple-600/20">
                      <div className="p-2 bg-purple-600/20 rounded-lg">
                        <Calendar className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Periode</div>
                        <div className="font-semibold text-slate-200">
                          {formatDate(formData.startDate)} - {formatDate(formData.endDate)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-blue-600/10 rounded-xl border border-blue-600/20">
                      <div className="p-2 bg-blue-600/20 rounded-lg">
                        <Clock className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Total Durasi</div>
                        <div className="font-semibold text-slate-200">
                          {getDurationString(formData.startDate, formData.endDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
               
              </div>

              {error && (
                 <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
                  <Info className="w-4 h-4" /> {error}
                </div>
              )}

              <Button fullWidth onClick={handleDateSubmit} className="mt-4">
                Tinjau & Kirim
              </Button>
            </div>
          )}

          {/* SUCCESS */}
          {step === Step.SUCCESS && (
            <div className="text-center animate-fade-in-up">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Check className="w-10 h-10 text-green-500" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-2">Permintaan Terkirim!</h2>
              <p className="text-slate-400 mb-8 max-w-xs mx-auto">
                Kami telah menerima permintaan penyimpanan Anda. Tim kami akan segera menghubungi Anda via WhatsApp untuk konfirmasi penyerahan.
              </p>
              
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-left mb-8 max-w-sm mx-auto">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Ringkasan</div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Sepeda</span>
                  <span className="font-medium text-white">{formData.bikeModel}</span>
                </div>
                {formData.accessories && (
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Aksesoris</span>
                    <span className="font-medium text-white text-right text-sm pl-4 whitespace-pre-wrap">{formData.accessories}</span>
                  </div>
                )}
                <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-slate-700">
                   <div className="flex justify-between items-start">
                    <span className="text-slate-400 text-sm">Periode</span>
                    <div className="text-right">
                       <span className="font-medium text-white text-sm block">
                        {formatDate(formData.startDate)} - {formatDate(formData.endDate)}
                       </span>
                       <span className="text-purple-400 text-xs font-semibold block mt-1">
                        ({getDurationString(formData.startDate, formData.endDate)})
                       </span>
                    </div>
                   </div>
                </div>
              </div>

              <Button variant="secondary" onClick={resetForm}>
                Daftarkan Sepeda Lain
              </Button>
            </div>
          )}

        </main>
      </div>

      {/* TERMS MODAL */}
      {isTermsOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsTermsOpen(false)}
          ></div>
          <div className="relative w-full max-w-lg bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-800 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 bg-slate-900 rounded-t-2xl sticky top-0 z-10">
              <h3 className="text-xl font-bold text-white">Syarat & Ketentuan</h3>
              <p className="text-xs text-slate-500 mt-1">Layanan Penitipan Sepeda</p>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
              <p className="text-slate-400 leading-relaxed">
                Syarat dan Ketentuan ini ("Perjanjian") mengatur hubungan hukum antara Penyedia Jasa dan
                Pelanggan sehubungan dengan penggunaan fasilitas penyimpanan sepeda. Dengan
                menandatangani formulir pendaftaran atau menyetujui secara digital, Pelanggan dianggap telah
                membaca, memahami, dan menyetujui seluruh ketentuan yang tercantum di bawah ini.
              </p>

              <section className="space-y-2">
                <h4 className="font-bold text-white">PASAL 1. DEFINISI</h4>
                <div className="text-xs space-y-1 text-slate-400">
                  <p>Dalam Perjanjian ini, istilah-istilah di bawah ini memiliki arti sebagai berikut:</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li><strong>"Penyedia Jasa"</strong> adalah Daily Bike Jakarta, suatu entitas usaha yang menyediakan fasilitas dan layanan penyimpanan sepeda.</li>
                    <li><strong>"Pelanggan"</strong> adalah perorangan atau badan hukum yang menyerahkan sepeda miliknya untuk disimpan dan dikelola oleh Penyedia Jasa berdasarkan Perjanjian ini.</li>
                    <li><strong>"Objek Titipan"</strong> adalah satu unit sepeda beserta komponen-komponen yang melekat padanya (attached components) yang diserahkan oleh Pelanggan kepada Penyedia Jasa.</li>
                    <li><strong>"Masa Sewa"</strong> adalah periode waktu penyimpanan yang telah disepakati dan dibayar lunas oleh Pelanggan.</li>
                  </ol>
                </div>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white">PASAL 2. TATA CARA PENERIMAAN DAN INSPEKSI (CHECK-IN)</h4>
                <ol className="list-decimal pl-4 space-y-2 text-xs text-slate-400">
                  <li>Setiap Objek Titipan yang akan masuk ke fasilitas penyimpanan wajib melalui proses inspeksi fisik dan dokumentasi visual yang dilakukan oleh staf Penyedia Jasa.</li>
                  <li>Pelanggan wajib memberitahukan secara jujur, jelas, dan rinci mengenai segala cacat, kerusakan, atau kondisi khusus pada Objek Titipan sebelum diserahkan. Segala cacat yang tidak dilaporkan namun ditemukan di kemudian hari akan dianggap sebagai kondisi bawaan (pre-existing condition).</li>
                  <li><strong>Kewajiban Pencatatan:</strong> Segala aksesoris berharga yang ditinggalkan pada sepeda <strong>WAJIB DICATAT</strong> secara rinci dalam Formulir Serah Terima (Check-in Form) atau terekam jelas dalam foto inspeksi awal.</li>
                  <li>Penyedia Jasa <strong>tidak bertanggung jawab</strong> atas kehilangan aksesoris yang <strong>tidak tercatat</strong> dalam formulir atau tidak terekam dalam foto dokumentasi saat check-in.</li>
                </ol>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white">PASAL 3. MEKANISME PENYIMPANAN DAN HAK AKSES</h4>
                <ol className="list-decimal pl-4 space-y-2 text-xs text-slate-400">
                  <li>Layanan ini merupakan sewa ruang penyimpanan (storage slot) dengan sistem Valet Service.</li>
                  <li>Selama Masa Sewa masih berlaku, Pelanggan berhak untuk mengambil Objek Titipan guna penggunaan sementara (ride) dan mengembalikannya ke fasilitas penyimpanan tanpa dikenakan biaya tambahan.</li>
                  <li>Permintaan penyiapan Objek Titipan untuk penggunaan sebagaimana dimaksud dalam Ayat (2) wajib diberitahukan oleh Pelanggan kepada Penyedia Jasa selambat-lambatnya 1 (satu) hari sebelum waktu penggunaan (H-1) melalui saluran komunikasi resmi yang ditetapkan Penyedia Jasa.</li>
                </ol>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white">PASAL 4. BIAYA, PEMBAYARAN, DAN SANKSI KETERLAMBATAN</h4>
                <ol className="list-decimal pl-4 space-y-2 text-xs text-slate-400">
                  <li>Biaya penyimpanan wajib dilunasi di muka (prepaid) oleh Pelanggan sesuai dengan paket durasi yang dipilih.</li>
                  <li>Apabila Pelanggan tidak mengambil Objek Titipan atau tidak memperpanjang Masa Sewa dalam jangka waktu maksimal 1 hari kalender setelah tanggal berakhirnya Masa Sewa (expiry date), maka Pelanggan dikenakan denda keterlambatan harian sebesar tarif normal harian yang berlaku.</li>
                  <li>Dalam hal tunggakan biaya penyimpanan dan/atau denda belum dilunasi dalam jangka waktu lebih dari 30 (tiga puluh) hari kalender sejak tanggal jatuh tempo, maka Penyedia Jasa berhak sepenuhnya untuk menggunakan <strong>Hak Retensi</strong> (hak menahan barang) atas Objek Titipan sampai seluruh kewajiban pembayaran dilunasi oleh Pelanggan.</li>
                </ol>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white">PASAL 5. BATASAN TANGGUNG JAWAB (LIMITATION OF LIABILITY)</h4>
                <ol className="list-decimal pl-4 space-y-2 text-xs text-slate-400">
                  <li>Penyedia Jasa bertanggung jawab penuh atas keamanan fisik Objek Titipan (termasuk aksesoris yang tercatat) selama berada di dalam area fasilitas penyimpanan.</li>
                  <li>Penyedia Jasa berkewajiban memberikan ganti rugi apabila terjadi kehilangan atau kerusakan fisik pada Objek Titipan yang terbukti secara sah dan meyakinkan disebabkan oleh kelalaian (negligence) atau kesalahan staf Penyedia Jasa.</li>
                  <li>
                    Menyimpang dari ketentuan Ayat (1) dan (2) Pasal ini, Penyedia Jasa <strong>dibebaskan dari segala tuntutan ganti rugi</strong> atas:
                    <ul className="list-[lower-alpha] pl-4 mt-1 space-y-1">
                      <li>Kerusakan kosmetik minor (seperti lecet halus) yang tidak terdeteksi pada saat inspeksi awal dikarenakan kondisi Objek Titipan yang kotor;</li>
                      <li>Kerusakan fungsional yang timbul akibat keausan wajar (wear and tear), korosi alami, atau usia komponen (misal: ban kempes sendiri, baterai shifter habis/bocor, rantai berkarat);</li>
                      <li>Kehilangan aksesoris kecil (loose items) yang tidak terdaftar dalam Formulir Serah Terima; dan</li>
                      <li>Segala bentuk kerusakan atau kehilangan yang terjadi pada saat Objek Titipan digunakan oleh Pelanggan di luar area fasilitas Penyedia Jasa (On Ride).</li>
                    </ul>
                  </li>
                </ol>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white">PASAL 6. FORCE MAJEURE</h4>
                <ol className="list-decimal pl-4 space-y-2 text-xs text-slate-400">
                  <li>Force Majeure adalah peristiwa atau keadaan yang terjadi di luar kekuasaan dan kendali wajar Penyedia Jasa, yang tidak dapat diantisipasi, dan mengakibatkan Penyedia Jasa tidak dapat melaksanakan kewajibannya berdasarkan Perjanjian ini.</li>
                  <li>Peristiwa yang dikategorikan sebagai Force Majeure meliputi namun tidak terbatas pada: a. Bencana alam; b. Kebakaran yang bukan disebabkan oleh kelalaian Penyedia Jasa; c. Perang, huru-hara, pemogokan massal; dan/atau d. Perubahan peraturan perundang-undangan.</li>
                  <li>Dalam hal terjadi kerusakan atau musnahnya Objek Titipan yang disebabkan secara langsung oleh Force Majeure, Pelanggan dengan ini setuju untuk membebaskan Penyedia Jasa dari segala tuntutan ganti rugi, baik secara perdata maupun pidana.</li>
                </ol>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white">PASAL 7. PENGAMBILAN KEMBALI DAN PENGAKHIRAN PERJANJIAN</h4>
                <ol className="list-decimal pl-4 space-y-2 text-xs text-slate-400">
                  <li>Pengambilan Objek Titipan secara permanen (Check-out) sebagai tanda berakhirnya Perjanjian hanya dapat dilakukan oleh Pelanggan yang namanya terdaftar atau kuasanya yang sah dengan menunjukkan bukti kepemilikan tiket atau identitas asli.</li>
                  <li>Penyedia Jasa berhak menolak penyerahan Objek Titipan apabila Pelanggan belum melunasi seluruh kewajiban biaya sewa, biaya jasa bengkel (jika ada), maupun denda keterlambatan yang timbul.</li>
                </ol>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-white">PASAL 8. HUKUM YANG BERLAKU</h4>
                <p className="text-xs text-slate-400">Perjanjian ini diatur, ditafsirkan, dan dilaksanakan berdasarkan hukum Negara Republik Indonesia.</p>
              </section>
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900 rounded-b-2xl">
              <label className="flex items-start gap-3 mb-6 cursor-pointer group">
                <div className={`mt-0.5 min-w-[1.5rem] h-6 rounded border flex items-center justify-center transition-colors ${agreedToTerms ? 'bg-purple-600 border-purple-600' : 'border-slate-600 group-hover:border-purple-500'}`}>
                  {agreedToTerms && <Check className="w-4 h-4 text-white" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={agreedToTerms} 
                  onChange={(e) => setAgreedToTerms(e.target.checked)} 
                />
                <span className="text-xs leading-relaxed text-slate-300 group-hover:text-white transition-colors">
                  Dengan ini saya menyatakan bahwa saya telah membaca, memahami isi, dan menyetujui untuk tunduk pada seluruh ketentuan yang tercantum dalam Syarat dan Ketentuan Layanan Penitipan Sepeda ini.
                </span>
              </label>

              <div className="flex gap-3">
                <Button variant="secondary" fullWidth onClick={() => setIsTermsOpen(false)}>
                  Batal
                </Button>
                <Button fullWidth onClick={handleSubmit} disabled={!agreedToTerms} isLoading={isSubmitting}>
                  Konfirmasi
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;