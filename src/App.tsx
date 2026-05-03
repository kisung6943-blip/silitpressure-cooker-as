/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Printer, Plus, Trash2, Image as ImageIcon, X, 
  Download, Upload, Save, CheckCircle, RefreshCcw, 
  FileText, User, CreditCard, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Item = {
  id: string;
  name: string;
  qty: number;
  price: number;
};

type Provider = {
  company: string;
  manager: string;
  phone: string;
  email: string;
};

const initialItems: Item[] = [
  { id: '1', name: '압력솥 뚜껑 안전밸브 세트', qty: 100, price: 3500 },
  { id: '2', name: '윗손잡이', qty: 1, price: 0 },
  { id: '3', name: '바이오밸브', qty: 1, price: 0 },
  { id: '4', name: '오링', qty: 1, price: 0 },
  { id: '5', name: '실링캡', qty: 1, price: 0 },
  { id: '6', name: '고무패킹', qty: 1, price: 0 },
];

export default function App() {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [provider, setProvider] = useState<Provider>({
    company: '이에스리빙',
    manager: '남기성',
    phone: '010-8864-0081',
    email: 'kisung6943@naver.com',
  });
  const [clientName, setClientName] = useState('고객님');
  const [date, setDate] = useState('');
  const [bankType, setBankType] = useState<'nh' | 'shinhan'>('nh');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Initialize and Load
  useEffect(() => {
    const today = new Date();
    setDate(`${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`);
    
    const savedData = localStorage.getItem('as-quotation-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.items) setItems(parsed.items);
        if (parsed.provider) setProvider(parsed.provider);
        if (parsed.clientName) setClientName(parsed.clientName);
        if (parsed.date) setDate(parsed.date);
        if (parsed.bankType) setBankType(parsed.bankType);
      } catch (e) {
        console.error("Failed to load saved data", e);
      }
    }

    const savedImage = localStorage.getItem('partsImage');
    if (savedImage) {
      setReferenceImage(savedImage);
    }
  }, []);

  // Auto-save logic
  const saveData = useCallback(() => {
    setIsSaving(true);
    const data = { items, provider, clientName, date, bankType };
    localStorage.setItem('as-quotation-data', JSON.stringify(data));
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
    }, 500);
  }, [items, provider, clientName, date]);

  useEffect(() => {
    const timer = setTimeout(() => {
      saveData();
    }, 1000);
    return () => clearTimeout(timer);
  }, [items, provider, clientName, date, bankType, saveData]);

  const totalAmount = items.reduce((sum, item) => sum + item.qty * item.price, 0);

  const handleItemChange = (id: string, field: keyof Item, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleAddItem = () => {
    const newItem: Item = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      qty: 1,
      price: 0,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Image = event.target?.result as string;
        setReferenceImage(base64Image);
        try {
          localStorage.setItem('partsImage', base64Image);
        } catch (error) {
          alert("이미지 용량이 너무 커서 저장할 수 없습니다. 2MB 이하의 이미지를 사용해주세요.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setReferenceImage(null);
    localStorage.removeItem('partsImage');
  };

  const handleExport = () => {
    const data = { items, provider, clientName, date, bankType, version: '1.0' };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `as-backup-${timestamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = JSON.parse(content);
          if (parsed.items) setItems(parsed.items);
          if (parsed.provider) setProvider(parsed.provider);
          if (parsed.clientName) setClientName(parsed.clientName);
          if (parsed.date) setDate(parsed.date);
          if (parsed.bankType) setBankType(parsed.bankType);
          alert("데이터를 성공적으로 불러왔습니다.");
        } catch (e) {
          alert("잘못된 파일 형식입니다.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleReset = () => {
    if (window.confirm("모든 데이터를 초기화하시겠습니까?")) {
      setItems(initialItems);
      setClientName('고객님');
      const today = new Date();
      setDate(`${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 font-sans text-slate-800">
      {/* Top Navigation / Controls */}
      <div className="max-w-5xl mx-auto mb-6 no-print">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">AS 견적서 관리자</h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                {isSaving ? (
                  <span className="flex items-center gap-1"><RefreshCcw size={12} className="animate-spin" /> 저장 중...</span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-600"><CheckCircle size={12} /> 자동 저장됨 {lastSaved && `(${lastSaved.toLocaleTimeString()})`}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button
              onClick={handleExport}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-sm font-medium transition-all"
              title="백업 파일 다운로드"
            >
              <Download size={16} />
              <span>백업</span>
            </button>
            <label className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer">
              <Upload size={16} />
              <span>복원</span>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            <button
              onClick={handleReset}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            >
              <RefreshCcw size={16} />
              <span>초기화</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Printer size={18} />
              <span>출력하기</span>
            </button>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white p-8 sm:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-3xl mb-8 print:shadow-none print:p-0 print:rounded-none print:mb-0 relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-blue-400 to-indigo-600 no-print" />
        
        {/* Quotation Header */}
        <div className="text-center mb-6 print:mb-2 relative">
          <h2 className="text-4xl font-black tracking-tight text-slate-900 border-b-4 border-slate-900 inline-block pb-3 px-10 uppercase print:text-2xl print:pb-0 print:border-b-2">
            견 적 서
          </h2>
          <p className="mt-4 text-slate-500 font-medium no-print">QUOTATION</p>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 print:gap-4 mb-6 print:mb-2">
          <div className="flex flex-col justify-end border-l-4 border-blue-600 pl-6 py-2 print:py-0 print:pl-3">
            <div className="flex items-center gap-2 mb-1 text-slate-400">
              <User size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">Client Info</span>
            </div>
            <div className="flex items-end gap-2 border-b-2 border-slate-200 pb-1 group focus-within:border-blue-500 transition-colors">
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="text-2xl font-black w-full focus:outline-none bg-transparent"
                placeholder="고객명 입력"
              />
              <span className="text-xl font-bold text-slate-600 whitespace-nowrap">귀하</span>
            </div>
            <div className="mt-4 text-sm text-slate-500 font-medium italic">
              아래와 같이 견적을 제출합니다.
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative">
            <div className="absolute -top-3 left-6 bg-blue-600 text-white px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-sm">
              Provider
            </div>
            <div className="space-y-3 mt-2 print:space-y-1 print:mt-1">
              {[
                { label: '상호', key: 'company', icon: <FileText size={14} /> },
                { label: '담당자', key: 'manager', icon: <User size={14} /> },
                { label: '연락처', key: 'phone', icon: <CreditCard size={14} /> },
                { label: '이메일', key: 'email', icon: <Calendar size={14} /> },
              ].map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                  <span className="w-16 text-xs font-bold text-slate-400">{item.label}</span>
                  <input
                    type="text"
                    className="flex-1 text-sm font-semibold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-400 focus:outline-none transition-colors"
                    value={provider[item.key as keyof Provider]}
                    onChange={(e) => setProvider({ ...provider, [item.key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Date and Total Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 print:mb-2 gap-4 py-6 print:py-1 border-y-2 border-slate-900 print:border-y">
          <div className="flex gap-3 text-slate-700 items-center bg-slate-50 print:bg-white px-4 py-2 rounded-xl print:px-0 print:py-0">
            <Calendar size={18} className="text-blue-600" />
            <span className="font-bold text-sm">작성일:</span>
            <input
              type="text"
              className="w-40 font-bold text-sm focus:outline-none bg-transparent"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="text-2xl font-black text-slate-900 flex gap-6 items-baseline print:text-xl">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-tighter">TOTAL (VAT Incl.)</span>
            <span className="text-blue-600">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6 print:mb-4 overflow-hidden rounded-2xl border border-slate-200 print:rounded-none">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900 text-white print:bg-slate-100 print:text-slate-900">
                <th className="py-4 print:py-2 px-4 w-12 text-center font-bold">NO</th>
                <th className="py-4 print:py-2 px-4 text-left font-bold uppercase tracking-wider">품목명 / Item Description</th>
                <th className="py-4 px-2 w-20 text-center font-bold">수량</th>
                <th className="py-4 px-4 w-32 text-right font-bold">단가</th>
                <th className="py-4 px-4 w-32 text-right font-bold">금액</th>
                <th className="w-12 no-print"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                  <motion.tr 
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="group hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-4 px-4 text-center text-slate-400 font-medium">{index + 1}</td>
                    <td className="p-0">
                      <input
                        type="text"
                        className="w-full h-full py-4 px-4 focus:outline-none font-semibold bg-transparent"
                        value={item.name}
                        onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                        placeholder="품목 입력"
                      />
                    </td>
                    <td className="p-0">
                      <input
                        type="number"
                        className="w-full h-full py-4 px-2 focus:outline-none text-center bg-transparent font-medium"
                        value={item.qty === 0 ? '' : item.qty}
                        onChange={(e) => handleItemChange(item.id, 'qty', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </td>
                    <td className="p-0">
                      <input
                        type="number"
                        className="w-full h-full py-4 px-4 focus:outline-none text-right bg-transparent font-medium"
                        value={item.price === 0 ? '' : item.price}
                        onChange={(e) => handleItemChange(item.id, 'price', parseInt(e.target.value) || 0)}
                        min="0"
                        step="100"
                      />
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-slate-700">
                      {item.qty > 0 && item.price > 0 ? formatCurrency(item.qty * item.price) : '-'}
                    </td>
                    <td className="p-1 text-center no-print">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-300 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-rose-50"
                        title="품목 삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 print:bg-white font-black border-t-2 border-slate-200 print:border-t">
                <td colSpan={4} className="py-5 print:py-1 px-6 text-right text-slate-500 uppercase tracking-widest text-[10px]">
                  합 계 (SUBTOTAL)
                </td>
                <td className="py-5 print:py-1 px-6 text-right text-xl print:text-base text-blue-700">
                  {formatCurrency(totalAmount)}
                </td>
                <td className="no-print"></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <button
          onClick={handleAddItem}
          className="mb-10 flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 no-print px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all active:scale-95"
        >
          <Plus size={18} />
          <span>품목 추가 (Add Line)</span>
        </button>

        {/* Payment and Bank Account */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="md:col-span-2 flex flex-col gap-2 p-6 print:p-1 bg-slate-50 print:bg-white rounded-2xl border border-slate-200 border-dashed print:border-none relative group">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-slate-400 no-print" />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-500">Payment Information</h3>
              </div>
              
              <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 no-print">
                <button 
                  onClick={() => setBankType('nh')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${bankType === 'nh' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  농협
                </button>
                <button 
                  onClick={() => setBankType('shinhan')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${bankType === 'shinhan' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  신한
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex gap-2 items-center">
                <span className="font-bold text-slate-900">입금계좌:</span>
                <span className="font-black text-blue-700 text-lg">
                  {bankType === 'nh' 
                    ? '농협 351-1237-0729-73 이에스리빙' 
                    : '신한은행 100-034-808558 이에스리빙'}
                </span>
              </div>
              {bankType === 'nh' && (
                <div className="inline-flex items-center gap-2 text-rose-600 font-bold text-xs bg-rose-50 px-3 py-1 rounded-full w-fit mt-1">
                  <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                  ※ 고객님 전화번호로 현금영수증이 자동 발행됩니다.
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col justify-center items-end pr-8 print:pr-0">
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 print:mb-2">Authorized Signature</p>
              <div className="relative inline-block">
                <span className="text-2xl font-black text-slate-900 tracking-tighter print:text-xl">{provider.company}</span>
                <div className="absolute -right-12 -top-4 w-16 h-16 border-4 border-rose-600 rounded-full flex items-center justify-center text-rose-600 font-black text-xl rotate-12 opacity-80 border-double print:w-12 print:h-12 print:text-base print:-right-10 print:-top-2">
                  인
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Parts Reference Section */}
        <div className="mt-10 print:mt-2 pt-10 print:pt-2 border-t-2 border-slate-100 print:border-t print-avoid-break">
          <div className="flex justify-between items-center mb-6 print:mb-1">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-slate-900 rounded-full no-print" />
              <h2 className="text-2xl print:text-sm font-black tracking-tight text-slate-900">
                [참고] 실리트 압력밥솥 부품 명칭
              </h2>
            </div>
            {!referenceImage && (
              <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl shadow-lg text-sm no-print flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95">
                <ImageIcon size={18} />
                <span className="font-bold">이미지 업로드</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>
          
          <div className="bg-slate-50 print:bg-white rounded-3xl p-4 border-2 border-slate-100 border-dashed print:border-none relative flex flex-col items-center justify-center print:p-0 min-h-[400px] print:min-h-0 group">
            {referenceImage ? (
              <div className="w-full relative">
                <motion.img 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={referenceImage} 
                  alt="압력솥 부품 명칭" 
                  className="w-full max-w-3xl print:max-w-md mx-auto rounded-xl shadow-2xl print:shadow-none" 
                />
                <button 
                  onClick={handleImageRemove}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-rose-600 p-3 rounded-2xl shadow-xl no-print transition-all hover:bg-rose-600 hover:text-white opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                  title="이미지 삭제"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
               <div className="text-center w-full max-w-md no-print py-16">
                 <div className="w-20 h-20 bg-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-400">
                    <ImageIcon size={40} />
                 </div>
                 <p className="text-slate-600 font-bold mb-2 text-lg">참고 이미지가 없습니다.</p>
                 <p className="text-slate-400 text-sm leading-relaxed">
                   우측 상단 '이미지 업로드' 버튼을 통해 <br/>부품 명칭 가이드 이미지를 추가할 수 있습니다.
                 </p>
                 <div className="mt-8 bg-blue-50 text-blue-600 px-4 py-3 rounded-2xl text-xs font-bold inline-block border border-blue-100">
                   Tip: 한 번 업로드하면 브라우저에 영구 저장됩니다.
                 </div>
               </div>
            )}
          </div>
        </div>

        <div className="mt-20 text-center text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] no-print">
          &copy; {new Date().getFullYear()} ES LIVING SYSTEM. ALL RIGHTS RESERVED.
        </div>
      </motion.div>
    </div>
  );
}

