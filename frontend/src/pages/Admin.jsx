import React, { useState, useEffect, useRef } from 'react';
import { Upload, Music, DollarSign, TrendingUp, ShoppingBag, Plus, Trash2, X, Check, User, Mail, Tag, ChevronDown, Edit2, Percent, Clock, EyeOff, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

export const Admin = () => {
  const [activeTab, setActiveTab] = useState('beats'); // 'beats' | 'sales' | 'genres'
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingBeat, setEditingBeat] = useState(null);
  const [beats, setBeats] = useState([]);
  const [sales, setSales] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newGenre, setNewGenre] = useState('');
  const [addingGenre, setAddingGenre] = useState(false);
  
  // Estados para modales de promoción
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountBeat, setDiscountBeat] = useState(null);
  const [discountPercentage, setDiscountPercentage] = useState('');
  
  const [newBeat, setNewBeat] = useState({
    name: '',
    bpm: '',
    key: '',
    mood: '',
    genre: '',
    priceBasica: '',
    pricePremium: '',
    priceExclusiva: ''
  });
  
  // Estado para edición
  const [editBeat, setEditBeat] = useState({
    name: '',
    bpm: '',
    key: '',
    mood: '',
    genre: '',
    priceBasica: '',
    pricePremium: '',
    priceExclusiva: ''
  });
  const [editAudioFile, setEditAudioFile] = useState(null);
  const [editCoverFile, setEditCoverFile] = useState(null);
  const [editWavFile, setEditWavFile] = useState(null);
  const [editStemsFile, setEditStemsFile] = useState(null);
  
  // Estados para contratos (6 tipos: 3 licencias x 2 idiomas)
  const [contractBasicaEs, setContractBasicaEs] = useState(null);
  const [contractPremiumEs, setContractPremiumEs] = useState(null);
  const [contractExclusivaEs, setContractExclusivaEs] = useState(null);
  const [contractBasicaEn, setContractBasicaEn] = useState(null);
  const [contractPremiumEn, setContractPremiumEn] = useState(null);
  const [contractExclusivaEn, setContractExclusivaEn] = useState(null);
  
  // Estados para contratos en edición
  const [editContractBasicaEs, setEditContractBasicaEs] = useState(null);
  const [editContractPremiumEs, setEditContractPremiumEs] = useState(null);
  const [editContractExclusivaEs, setEditContractExclusivaEs] = useState(null);
  const [editContractBasicaEn, setEditContractBasicaEn] = useState(null);
  const [editContractPremiumEn, setEditContractPremiumEn] = useState(null);
  const [editContractExclusivaEn, setEditContractExclusivaEn] = useState(null);
  
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [wavFile, setWavFile] = useState(null);
  const [stemsFile, setStemsFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [wavPreview, setWavPreview] = useState(null);
  const [stemsPreview, setStemsPreview] = useState(null);
  
  const audioInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const wavInputRef = useRef(null);
  const stemsInputRef = useRef(null);
  
  // Refs para contratos
  const contractBasicaEsRef = useRef(null);
  const contractPremiumEsRef = useRef(null);
  const contractExclusivaEsRef = useRef(null);
  const contractBasicaEnRef = useRef(null);
  const contractPremiumEnRef = useRef(null);
  const contractExclusivaEnRef = useRef(null);
  
  const editAudioInputRef = useRef(null);
  const editCoverInputRef = useRef(null);
  const editWavInputRef = useRef(null);
  const editStemsInputRef = useRef(null);
  
  // Refs para contratos en edición
  const editContractBasicaEsRef = useRef(null);
  const editContractPremiumEsRef = useRef(null);
  const editContractExclusivaEsRef = useRef(null);
  const editContractBasicaEnRef = useRef(null);
  const editContractPremiumEnRef = useRef(null);
  const editContractExclusivaEnRef = useRef(null);

  useEffect(() => {
    fetchBeats();
    fetchSales();
    fetchGenres();
  }, []);

  const fetchBeats = async () => {
    try {
      // include_hidden=true para que el admin vea todos los beats
      const response = await axios.get(`${API}/beats?include_hidden=true`);
      setBeats(response.data.beats || []);
    } catch (error) {
      console.error('Error cargando beats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await axios.get(`${API}/payment/sales`);
      setSales(response.data.sales || []);
    } catch (error) {
      console.error('Error cargando ventas:', error);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await axios.get(`${API}/beats/genres/list`);
      setGenres(response.data.genres || []);
    } catch (error) {
      console.error('Error cargando géneros:', error);
    }
  };

  const handleAddGenre = async (e) => {
    e.preventDefault();
    if (!newGenre.trim()) return;
    
    setAddingGenre(true);
    try {
      const formData = new FormData();
      formData.append('name', newGenre.trim());
      
      await axios.post(`${API}/beats/genres/add`, formData);
      toast.success(`Género "${newGenre}" agregado`);
      setNewGenre('');
      fetchGenres();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al agregar género');
    } finally {
      setAddingGenre(false);
    }
  };

  const handleDeleteGenre = async (genreId, genreName) => {
    if (!window.confirm(`¿Eliminar el género "${genreName}"?`)) return;
    
    try {
      await axios.delete(`${API}/beats/genres/${genreId}`);
      toast.success('Género eliminado');
      fetchGenres();
    } catch (error) {
      toast.error('Error al eliminar género');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBeat(prev => ({ ...prev, [name]: value }));
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.match(/\.mp3$/i)) {
        toast.error('Por favor selecciona un archivo MP3 para exhibición');
        return;
      }
      setAudioFile(file);
      setAudioPreview(file.name);
    }
  };

  const handleWavChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.match(/\.wav$/i)) {
        toast.error('Por favor selecciona un archivo WAV');
        return;
      }
      setWavFile(file);
      setWavPreview(file.name);
    }
  };

  const handleStemsChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.match(/\.(rar|zip)$/i)) {
        toast.error('Por favor selecciona un archivo RAR o ZIP para los stems');
        return;
      }
      setStemsFile(file);
      setStemsPreview(file.name);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona una imagen válida');
        return;
      }
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setCoverPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!audioFile) {
      toast.error('Por favor selecciona un archivo MP3 de exhibición');
      return;
    }
    if (!coverFile) {
      toast.error('Por favor selecciona una imagen de portada');
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('name', newBeat.name);
      formData.append('genre', newBeat.genre);
      formData.append('bpm', newBeat.bpm);
      formData.append('key', newBeat.key);
      formData.append('mood', newBeat.mood);
      formData.append('price_basica', newBeat.priceBasica);
      formData.append('price_premium', newBeat.pricePremium);
      formData.append('price_exclusiva', newBeat.priceExclusiva);
      formData.append('audio_file', audioFile);
      formData.append('cover_file', coverFile);
      
      // Agregar WAV si existe
      if (wavFile) {
        formData.append('wav_file', wavFile);
      }
      
      // Agregar stems si existe
      if (stemsFile) {
        formData.append('stems_file', stemsFile);
      }
      
      // Agregar contratos en español
      if (contractBasicaEs) {
        formData.append('contract_basica_es', contractBasicaEs);
      }
      if (contractPremiumEs) {
        formData.append('contract_premium_es', contractPremiumEs);
      }
      if (contractExclusivaEs) {
        formData.append('contract_exclusiva_es', contractExclusivaEs);
      }
      
      // Agregar contratos en inglés
      if (contractBasicaEn) {
        formData.append('contract_basica_en', contractBasicaEn);
      }
      if (contractPremiumEn) {
        formData.append('contract_premium_en', contractPremiumEn);
      }
      if (contractExclusivaEn) {
        formData.append('contract_exclusiva_en', contractExclusivaEn);
      }
      
      await axios.post(`${API}/beats/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('¡Beat publicado exitosamente!');
      
      setShowUploadForm(false);
      setNewBeat({ name: '', bpm: '', key: '', mood: '', genre: '', priceBasica: '', pricePremium: '', priceExclusiva: '' });
      setAudioFile(null);
      setCoverFile(null);
      setWavFile(null);
      setStemsFile(null);
      setAudioPreview(null);
      setCoverPreview(null);
      setWavPreview(null);
      setStemsPreview(null);
      // Limpiar contratos
      setContractBasicaEs(null);
      setContractPremiumEs(null);
      setContractExclusivaEs(null);
      setContractBasicaEn(null);
      setContractPremiumEn(null);
      setContractExclusivaEn(null);
      fetchBeats();
      
    } catch (error) {
      console.error('Error subiendo beat:', error);
      toast.error('Error al subir el beat');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBeat = async (beatId, beatName) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${beatName}"?`)) return;
    
    try {
      await axios.delete(`${API}/beats/${beatId}`);
      toast.success('Beat eliminado');
      fetchBeats();
    } catch (error) {
      toast.error('Error al eliminar el beat');
    }
  };

  // ============ FUNCIONES DE PROMOCIÓN ============
  
  // Abrir modal de descuento
  const openDiscountModal = (beat) => {
    setDiscountBeat(beat);
    setDiscountPercentage(beat.discount_percentage || '');
    setShowDiscountModal(true);
  };

  // Aplicar descuento
  const handleApplyDiscount = async () => {
    if (!discountBeat) return;
    
    const percentage = parseInt(discountPercentage) || 0;
    
    try {
      await axios.post(`${API}/beats/${discountBeat.beat_id}/discount`, {
        discount_percentage: percentage
      });
      
      if (percentage > 0) {
        toast.success(`Descuento del ${percentage}% aplicado a "${discountBeat.name}"`);
      } else {
        toast.success(`Descuento eliminado de "${discountBeat.name}"`);
      }
      
      setShowDiscountModal(false);
      setDiscountBeat(null);
      setDiscountPercentage('');
      fetchBeats();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al aplicar descuento');
    }
  };

  // Toggle "Se va pronto"
  const handleToggleLeavingSoon = async (beat) => {
    try {
      const response = await axios.post(`${API}/beats/${beat.beat_id}/toggle-leaving-soon`);
      toast.success(response.data.message);
      fetchBeats();
    } catch (error) {
      toast.error('Error al cambiar estado');
    }
  };

  // Toggle visibilidad (ocultar/mostrar)
  const handleToggleVisibility = async (beat) => {
    try {
      const response = await axios.post(`${API}/beats/${beat.beat_id}/toggle-visibility`);
      toast.success(response.data.message);
      fetchBeats();
    } catch (error) {
      toast.error('Error al cambiar visibilidad');
    }
  };

  // Funciones de edición
  const handleEditBeat = (beat) => {
    setEditingBeat(beat);
    setEditBeat({
      name: beat.name || '',
      bpm: beat.bpm || '',
      key: beat.key || '',
      mood: beat.mood || '',
      genre: beat.genre || '',
      priceBasica: beat.price_basica || '',
      pricePremium: beat.price_premium || '',
      priceExclusiva: beat.price_exclusiva || ''
    });
    setEditAudioFile(null);
    setEditCoverFile(null);
    setEditWavFile(null);
    setEditStemsFile(null);
    setShowEditForm(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditBeat(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateBeat = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('name', editBeat.name);
      formData.append('genre', editBeat.genre);
      formData.append('bpm', editBeat.bpm);
      formData.append('key', editBeat.key);
      formData.append('mood', editBeat.mood);
      formData.append('price_basica', editBeat.priceBasica);
      formData.append('price_premium', editBeat.pricePremium);
      formData.append('price_exclusiva', editBeat.priceExclusiva);
      
      // Agregar archivos solo si se seleccionaron nuevos
      if (editAudioFile) {
        formData.append('audio_file', editAudioFile);
      }
      if (editCoverFile) {
        formData.append('cover_file', editCoverFile);
      }
      if (editWavFile) {
        formData.append('wav_file', editWavFile);
      }
      if (editStemsFile) {
        formData.append('stems_file', editStemsFile);
      }
      
      // Agregar contratos en español
      if (editContractBasicaEs) {
        formData.append('contract_basica_es', editContractBasicaEs);
      }
      if (editContractPremiumEs) {
        formData.append('contract_premium_es', editContractPremiumEs);
      }
      if (editContractExclusivaEs) {
        formData.append('contract_exclusiva_es', editContractExclusivaEs);
      }
      
      // Agregar contratos en inglés
      if (editContractBasicaEn) {
        formData.append('contract_basica_en', editContractBasicaEn);
      }
      if (editContractPremiumEn) {
        formData.append('contract_premium_en', editContractPremiumEn);
      }
      if (editContractExclusivaEn) {
        formData.append('contract_exclusiva_en', editContractExclusivaEn);
      }
      
      const response = await axios.put(`${API}/beats/${editingBeat.beat_id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log('Update response:', response.data);
      toast.success('¡Beat actualizado exitosamente!');
      
      // Limpiar estado
      setShowEditForm(false);
      setEditingBeat(null);
      setEditAudioFile(null);
      setEditCoverFile(null);
      setEditWavFile(null);
      setEditStemsFile(null);
      // Limpiar contratos de edición
      setEditContractBasicaEs(null);
      setEditContractPremiumEs(null);
      setEditContractExclusivaEs(null);
      setEditContractBasicaEn(null);
      setEditContractPremiumEn(null);
      setEditContractExclusivaEn(null);
      
      // Refrescar lista de beats
      await fetchBeats();
      
    } catch (error) {
      console.error('Error actualizando beat:', error);
      toast.error(error.response?.data?.detail || 'Error al actualizar el beat');
    } finally {
      setUploading(false);
    }
  };

  const totalBeats = beats.length;
  const totalPlays = beats.reduce((sum, b) => sum + (b.plays || 0), 0);
  const totalSalesCount = sales.length;
  const totalRevenue = sales.reduce((sum, s) => sum + (s.amount || 0), 0);

  const licenseColors = {
    basica: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    premium: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    exclusiva: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen text-white pt-24 pb-20 relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-black"
        style={{
          backgroundImage: `url('https://customer-assets.emergentagent.com/job_music-marketplace-22/artifacts/zvg2771i_Dise%C3%B1o%20sin%20t%C3%ADtulo%20%2821%29.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Panel de Administración</h1>
            <p className="text-gray-400">Gestiona tu catálogo y ventas</p>
          </div>
          <Button className="bg-white hover:bg-gray-200 text-black" onClick={() => setShowUploadForm(!showUploadForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Subir Beat
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/50 border-gray-800/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <DollarSign className="w-8 h-8 text-white mb-2" />
              <div className="text-3xl font-bold mb-1 text-white">${totalRevenue.toFixed(2)}</div>
              <div className="text-sm text-gray-300">Ingresos Totales</div>
            </CardContent>
          </Card>
          <Card className="bg-black/50 border-gray-800/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <Music className="w-8 h-8 text-white mb-2" />
              <div className="text-3xl font-bold mb-1 text-white">{totalBeats}</div>
              <div className="text-sm text-gray-300">Beats en Catálogo</div>
            </CardContent>
          </Card>
          <Card className="bg-black/50 border-gray-800/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <TrendingUp className="w-8 h-8 text-white mb-2" />
              <div className="text-3xl font-bold mb-1 text-white">{totalPlays.toLocaleString()}</div>
              <div className="text-sm text-gray-300">Reproducciones</div>
            </CardContent>
          </Card>
          <Card className="bg-black/50 border-gray-800/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <ShoppingBag className="w-8 h-8 text-white mb-2" />
              <div className="text-3xl font-bold mb-1 text-white">{totalSalesCount}</div>
              <div className="text-sm text-gray-300">Ventas Totales</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'beats' ? 'default' : 'outline'}
            className={activeTab === 'beats' ? 'bg-white text-black' : 'border-gray-800/20 text-gray-400'}
            onClick={() => setActiveTab('beats')}
          >
            <Music className="w-4 h-4 mr-2" />
            Beats ({totalBeats})
          </Button>
          <Button
            variant={activeTab === 'sales' ? 'default' : 'outline'}
            className={activeTab === 'sales' ? 'bg-white text-black' : 'border-gray-800/20 text-gray-400'}
            onClick={() => setActiveTab('sales')}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Ventas ({totalSalesCount})
          </Button>
          <Button
            variant={activeTab === 'genres' ? 'default' : 'outline'}
            className={activeTab === 'genres' ? 'bg-white text-black' : 'border-gray-800/20 text-gray-400'}
            onClick={() => setActiveTab('genres')}
          >
            <Tag className="w-4 h-4 mr-2" />
            Géneros ({genres.length})
          </Button>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <Card className="bg-black/50 border-gray-800/20 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                <span>Subir Nuevo Beat</span>
                <Button variant="ghost" size="sm" onClick={() => setShowUploadForm(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-white">Nombre del Beat *</Label>
                    <Input id="name" name="name" value={newBeat.name} onChange={handleInputChange}
                      className="bg-black/50 border-gray-800/20 text-white placeholder:text-gray-400" placeholder="Ej: Midnight Trap" required />
                  </div>
                  <div>
                    <Label htmlFor="genre" className="text-white">Género *</Label>
                    <select
                      id="genre"
                      name="genre"
                      value={newBeat.genre}
                      onChange={handleInputChange}
                      className="w-full mt-1 bg-black/50 border border-gray-800/20 rounded-md px-3 py-2 text-white focus:outline-none focus:border-gray-200"
                      required
                    >
                      <option value="">Selecciona un género</option>
                      {genres.map((genre) => (
                        <option key={genre.genre_id} value={genre.name}>
                          {genre.name}
                        </option>
                      ))}
                    </select>
                    {genres.length === 0 && (
                      <p className="text-xs text-yellow-500 mt-1">
                        No hay géneros. Agrega uno en la pestaña "Géneros".
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="bpm" className="text-white">BPM *</Label>
                    <Input id="bpm" name="bpm" type="number" value={newBeat.bpm} onChange={handleInputChange}
                      className="bg-black/50 border-gray-800/20 text-white placeholder:text-gray-400" placeholder="140" required />
                  </div>
                  <div>
                    <Label htmlFor="key" className="text-white">Tonalidad *</Label>
                    <Input id="key" name="key" value={newBeat.key} onChange={handleInputChange}
                      className="bg-black/50 border-gray-800/20 text-white placeholder:text-gray-400" placeholder="C Minor" required />
                  </div>
                  <div>
                    <Label htmlFor="mood" className="text-white">Mood *</Label>
                    <Input id="mood" name="mood" value={newBeat.mood} onChange={handleInputChange}
                      className="bg-black/50 border-gray-800/20 text-white placeholder:text-gray-400" placeholder="Dark, Energetic" required />
                  </div>
                </div>

                {/* Audio Upload - MP3 */}
                <div>
                  <Label className="text-white">Archivo MP3 (Exhibición y Licencia Básica) *</Label>
                  <p className="text-xs text-gray-300 mb-2">Este archivo será usado para preview y descargas de licencia básica</p>
                  <div 
                    className={`mt-2 flex justify-center px-6 py-8 border-2 border-dashed rounded-lg cursor-pointer ${
                      audioFile ? 'border-green-600/50 bg-green-950/10' : 'border-gray-800/20 hover:border-gray-200/50'
                    }`}
                    onClick={() => audioInputRef.current?.click()}
                  >
                    {audioFile ? (
                      <div className="text-center">
                        <Check className="mx-auto h-8 w-8 text-green-500" />
                        <p className="text-sm text-green-400 mt-2">{audioPreview}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="text-sm text-gray-400 mt-2">Click para seleccionar MP3</p>
                      </div>
                    )}
                  </div>
                  <input ref={audioInputRef} type="file" className="hidden" accept=".mp3" onChange={handleAudioChange} />
                </div>

                {/* WAV Upload */}
                <div>
                  <Label className="text-white">Archivo WAV (Premium y Exclusiva)</Label>
                  <p className="text-xs text-gray-300 mb-2">Disponible para licencias Premium y Exclusiva</p>
                  <div 
                    className={`mt-2 flex justify-center px-6 py-8 border-2 border-dashed rounded-lg cursor-pointer ${
                      wavFile ? 'border-blue-600/50 bg-blue-950/10' : 'border-gray-800/20 hover:border-gray-200/50'
                    }`}
                    onClick={() => wavInputRef.current?.click()}
                  >
                    {wavFile ? (
                      <div className="text-center">
                        <Check className="mx-auto h-8 w-8 text-blue-500" />
                        <p className="text-sm text-blue-400 mt-2">{wavPreview}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-white" />
                        <p className="text-sm text-white mt-2">Click para seleccionar WAV (opcional)</p>
                      </div>
                    )}
                  </div>
                  <input ref={wavInputRef} type="file" className="hidden" accept=".wav" onChange={handleWavChange} />
                </div>

                {/* Stems Upload */}
                <div>
                  <Label className="text-white">Stems RAR/ZIP (Solo Exclusiva)</Label>
                  <p className="text-xs text-gray-300 mb-2">Disponible únicamente para licencia Exclusiva</p>
                  <div 
                    className={`mt-2 flex justify-center px-6 py-8 border-2 border-dashed rounded-lg cursor-pointer ${
                      stemsFile ? 'border-yellow-600/50 bg-yellow-950/10' : 'border-gray-800/20 hover:border-gray-200/50'
                    }`}
                    onClick={() => stemsInputRef.current?.click()}
                  >
                    {stemsFile ? (
                      <div className="text-center">
                        <Check className="mx-auto h-8 w-8 text-yellow-500" />
                        <p className="text-sm text-yellow-400 mt-2">{stemsPreview}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-white" />
                        <p className="text-sm text-white mt-2">Click para seleccionar RAR/ZIP (opcional)</p>
                      </div>
                    )}
                  </div>
                  <input ref={stemsInputRef} type="file" className="hidden" accept=".rar,.zip" onChange={handleStemsChange} />
                </div>

                {/* Cover Upload */}
                <div>
                  <Label className="text-white">Imagen de Portada *</Label>
                  <div 
                    className={`mt-2 flex justify-center px-6 py-8 border-2 border-dashed rounded-lg cursor-pointer ${
                      coverFile ? 'border-green-600/50 bg-green-950/10' : 'border-gray-800/20 hover:border-gray-200/50'
                    }`}
                    onClick={() => coverInputRef.current?.click()}
                  >
                    {coverPreview ? (
                      <img src={coverPreview} alt="Preview" className="h-24 w-24 object-cover rounded-lg" />
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-white" />
                        <p className="text-sm text-white mt-2">Click para seleccionar</p>
                      </div>
                    )}
                  </div>
                  <input ref={coverInputRef} type="file" className="hidden" accept="image/*" onChange={handleCoverChange} />
                </div>

                {/* Prices */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="priceBasica" className="text-white">Licencia Básica ($) *</Label>
                    <Input id="priceBasica" name="priceBasica" type="number" step="0.01" value={newBeat.priceBasica}
                      onChange={handleInputChange} className="bg-black/50 border-gray-800/20 text-white placeholder:text-gray-400" placeholder="29.99" required />
                  </div>
                  <div>
                    <Label htmlFor="pricePremium" className="text-white">Licencia Premium ($) *</Label>
                    <Input id="pricePremium" name="pricePremium" type="number" step="0.01" value={newBeat.pricePremium}
                      onChange={handleInputChange} className="bg-black/50 border-gray-800/20 text-white placeholder:text-gray-400" placeholder="79.99" required />
                  </div>
                  <div>
                    <Label htmlFor="priceExclusiva" className="text-white">Licencia Exclusiva ($) *</Label>
                    <Input id="priceExclusiva" name="priceExclusiva" type="number" step="0.01" value={newBeat.priceExclusiva}
                      onChange={handleInputChange} className="bg-black/50 border-gray-800/20 text-white placeholder:text-gray-400" placeholder="299.99" required />
                  </div>
                </div>

                {/* Contratos de Licencia - Español */}
                <div className="border-t border-gray-800/30 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">📄 Contratos de Licencia - Español</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-white text-sm">Contrato Básica (ES)</Label>
                      <div 
                        className={`mt-2 flex justify-center px-4 py-4 border-2 border-dashed rounded-lg cursor-pointer ${
                          contractBasicaEs ? 'border-green-600/50 bg-green-950/10' : 'border-gray-800/20 hover:border-gray-200/50'
                        }`}
                        onClick={() => contractBasicaEsRef.current?.click()}
                      >
                        <div className="text-center">
                          {contractBasicaEs ? (
                            <>
                              <Check className="mx-auto h-6 w-6 text-green-500" />
                              <p className="text-xs text-green-400 mt-1 truncate max-w-[120px]">{contractBasicaEs.name}</p>
                            </>
                          ) : (
                            <>
                              <Upload className="mx-auto h-6 w-6 text-gray-400" />
                              <p className="text-xs text-gray-400 mt-1">PDF</p>
                            </>
                          )}
                        </div>
                      </div>
                      <input ref={contractBasicaEsRef} type="file" className="hidden" accept=".pdf" onChange={(e) => e.target.files[0] && setContractBasicaEs(e.target.files[0])} />
                    </div>
                    <div>
                      <Label className="text-white text-sm">Contrato Premium (ES)</Label>
                      <div 
                        className={`mt-2 flex justify-center px-4 py-4 border-2 border-dashed rounded-lg cursor-pointer ${
                          contractPremiumEs ? 'border-blue-600/50 bg-blue-950/10' : 'border-gray-800/20 hover:border-gray-200/50'
                        }`}
                        onClick={() => contractPremiumEsRef.current?.click()}
                      >
                        <div className="text-center">
                          {contractPremiumEs ? (
                            <>
                              <Check className="mx-auto h-6 w-6 text-blue-500" />
                              <p className="text-xs text-blue-400 mt-1 truncate max-w-[120px]">{contractPremiumEs.name}</p>
                            </>
                          ) : (
                            <>
                              <Upload className="mx-auto h-6 w-6 text-gray-400" />
                              <p className="text-xs text-gray-400 mt-1">PDF</p>
                            </>
                          )}
                        </div>
                      </div>
                      <input ref={contractPremiumEsRef} type="file" className="hidden" accept=".pdf" onChange={(e) => e.target.files[0] && setContractPremiumEs(e.target.files[0])} />
                    </div>
                    <div>
                      <Label className="text-white text-sm">Contrato Exclusiva (ES)</Label>
                      <div 
                        className={`mt-2 flex justify-center px-4 py-4 border-2 border-dashed rounded-lg cursor-pointer ${
                          contractExclusivaEs ? 'border-yellow-600/50 bg-yellow-950/10' : 'border-gray-800/20 hover:border-gray-200/50'
                        }`}
                        onClick={() => contractExclusivaEsRef.current?.click()}
                      >
                        <div className="text-center">
                          {contractExclusivaEs ? (
                            <>
                              <Check className="mx-auto h-6 w-6 text-yellow-500" />
                              <p className="text-xs text-yellow-400 mt-1 truncate max-w-[120px]">{contractExclusivaEs.name}</p>
                            </>
                          ) : (
                            <>
                              <Upload className="mx-auto h-6 w-6 text-gray-400" />
                              <p className="text-xs text-gray-400 mt-1">PDF</p>
                            </>
                          )}
                        </div>
                      </div>
                      <input ref={contractExclusivaEsRef} type="file" className="hidden" accept=".pdf" onChange={(e) => e.target.files[0] && setContractExclusivaEs(e.target.files[0])} />
                    </div>
                  </div>
                </div>

                {/* Contratos de Licencia - Inglés */}
                <div className="border-t border-gray-800/30 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">📄 Contratos de Licencia - English</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-white text-sm">Basic Contract (EN)</Label>
                      <div 
                        className={`mt-2 flex justify-center px-4 py-4 border-2 border-dashed rounded-lg cursor-pointer ${
                          contractBasicaEn ? 'border-green-600/50 bg-green-950/10' : 'border-gray-800/20 hover:border-gray-200/50'
                        }`}
                        onClick={() => contractBasicaEnRef.current?.click()}
                      >
                        <div className="text-center">
                          {contractBasicaEn ? (
                            <>
                              <Check className="mx-auto h-6 w-6 text-green-500" />
                              <p className="text-xs text-green-400 mt-1 truncate max-w-[120px]">{contractBasicaEn.name}</p>
                            </>
                          ) : (
                            <>
                              <Upload className="mx-auto h-6 w-6 text-gray-400" />
                              <p className="text-xs text-gray-400 mt-1">PDF</p>
                            </>
                          )}
                        </div>
                      </div>
                      <input ref={contractBasicaEnRef} type="file" className="hidden" accept=".pdf" onChange={(e) => e.target.files[0] && setContractBasicaEn(e.target.files[0])} />
                    </div>
                    <div>
                      <Label className="text-white text-sm">Premium Contract (EN)</Label>
                      <div 
                        className={`mt-2 flex justify-center px-4 py-4 border-2 border-dashed rounded-lg cursor-pointer ${
                          contractPremiumEn ? 'border-blue-600/50 bg-blue-950/10' : 'border-gray-800/20 hover:border-gray-200/50'
                        }`}
                        onClick={() => contractPremiumEnRef.current?.click()}
                      >
                        <div className="text-center">
                          {contractPremiumEn ? (
                            <>
                              <Check className="mx-auto h-6 w-6 text-blue-500" />
                              <p className="text-xs text-blue-400 mt-1 truncate max-w-[120px]">{contractPremiumEn.name}</p>
                            </>
                          ) : (
                            <>
                              <Upload className="mx-auto h-6 w-6 text-gray-400" />
                              <p className="text-xs text-gray-400 mt-1">PDF</p>
                            </>
                          )}
                        </div>
                      </div>
                      <input ref={contractPremiumEnRef} type="file" className="hidden" accept=".pdf" onChange={(e) => e.target.files[0] && setContractPremiumEn(e.target.files[0])} />
                    </div>
                    <div>
                      <Label className="text-white text-sm">Exclusive Contract (EN)</Label>
                      <div 
                        className={`mt-2 flex justify-center px-4 py-4 border-2 border-dashed rounded-lg cursor-pointer ${
                          contractExclusivaEn ? 'border-yellow-600/50 bg-yellow-950/10' : 'border-gray-800/20 hover:border-gray-200/50'
                        }`}
                        onClick={() => contractExclusivaEnRef.current?.click()}
                      >
                        <div className="text-center">
                          {contractExclusivaEn ? (
                            <>
                              <Check className="mx-auto h-6 w-6 text-yellow-500" />
                              <p className="text-xs text-yellow-400 mt-1 truncate max-w-[120px]">{contractExclusivaEn.name}</p>
                            </>
                          ) : (
                            <>
                              <Upload className="mx-auto h-6 w-6 text-gray-400" />
                              <p className="text-xs text-gray-400 mt-1">PDF</p>
                            </>
                          )}
                        </div>
                      </div>
                      <input ref={contractExclusivaEnRef} type="file" className="hidden" accept=".pdf" onChange={(e) => e.target.files[0] && setContractExclusivaEn(e.target.files[0])} />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="bg-white hover:bg-gray-200 text-black" disabled={uploading}>
                    {uploading ? 'Subiendo...' : 'Publicar Beat'}
                  </Button>
                  <Button type="button" variant="outline" className="border-gray-800/20 text-white" onClick={() => setShowUploadForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Edit Beat Form Modal */}
        {showEditForm && editingBeat && (
          <Card className="bg-black/50 border-gray-800/20 backdrop-blur-sm mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Edit2 className="w-5 h-5" />
                  Editar Beat: {editingBeat.name}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowEditForm(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateBeat} className="space-y-6">
                {/* Información básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name" className="text-white">Nombre del Beat *</Label>
                    <Input id="edit-name" name="name" value={editBeat.name}
                      onChange={handleEditInputChange} className="bg-black/50 border-gray-800/20 text-white" required />
                  </div>
                  <div>
                    <Label htmlFor="edit-genre" className="text-white">Género *</Label>
                    <div className="relative">
                      <select
                        id="edit-genre"
                        name="genre"
                        value={editBeat.genre}
                        onChange={handleEditInputChange}
                        className="w-full h-10 px-3 bg-black/50 border border-gray-800/20 rounded-md text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/20"
                        required
                      >
                        <option value="">Seleccionar género</option>
                        {genres.map((genre) => (
                          <option key={genre.genre_id} value={genre.name}>{genre.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-bpm" className="text-white">BPM *</Label>
                    <Input id="edit-bpm" name="bpm" type="number" value={editBeat.bpm}
                      onChange={handleEditInputChange} className="bg-black/50 border-gray-800/20 text-white" required />
                  </div>
                  <div>
                    <Label htmlFor="edit-key" className="text-white">Key *</Label>
                    <Input id="edit-key" name="key" value={editBeat.key}
                      onChange={handleEditInputChange} className="bg-black/50 border-gray-800/20 text-white" required />
                  </div>
                  <div>
                    <Label htmlFor="edit-mood" className="text-white">Mood *</Label>
                    <Input id="edit-mood" name="mood" value={editBeat.mood}
                      onChange={handleEditInputChange} className="bg-black/50 border-gray-800/20 text-white" required />
                  </div>
                </div>

                {/* Archivos (opcionales para edición) */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Archivos (dejar vacío para mantener actuales)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* MP3 */}
                    <div>
                      <Label htmlFor="edit-audio-file" className="text-white">Nuevo MP3 de exhibición</Label>
                      <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                        editAudioFile ? 'border-green-500 bg-green-500/10' : 'border-gray-800/20 hover:border-white/50'
                      }`}>
                        <input
                          id="edit-audio-file"
                          type="file"
                          accept=".mp3,audio/mpeg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              console.log('Audio file selected:', file.name, file.size);
                              setEditAudioFile(file);
                            }
                          }}
                        />
                        {editAudioFile ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-500" />
                              <span className="text-green-500 text-sm">{editAudioFile.name}</span>
                            </div>
                            <button type="button" onClick={() => setEditAudioFile(null)} className="text-gray-400 hover:text-white">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label htmlFor="edit-audio-file" className="cursor-pointer block text-white text-sm">
                            Click para seleccionar MP3
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Cover */}
                    <div>
                      <Label htmlFor="edit-cover-file" className="text-white">Nueva portada</Label>
                      <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                        editCoverFile ? 'border-green-500 bg-green-500/10' : 'border-gray-800/20 hover:border-white/50'
                      }`}>
                        <input
                          id="edit-cover-file"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              console.log('Cover file selected:', file.name, file.size, file.type);
                              setEditCoverFile(file);
                            }
                          }}
                        />
                        {editCoverFile ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-500" />
                              <span className="text-green-500 text-sm">{editCoverFile.name}</span>
                            </div>
                            <button type="button" onClick={() => setEditCoverFile(null)} className="text-gray-400 hover:text-white">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label htmlFor="edit-cover-file" className="cursor-pointer block text-white text-sm">
                            Click para seleccionar imagen
                          </label>
                        )}
                      </div>
                    </div>

                    {/* WAV */}
                    <div>
                      <Label htmlFor="edit-wav-file" className="text-white">Nuevo archivo WAV</Label>
                      <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                        editWavFile ? 'border-green-500 bg-green-500/10' : 'border-gray-800/20 hover:border-white/50'
                      }`}>
                        <input
                          id="edit-wav-file"
                          type="file"
                          accept=".wav,audio/wav"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              console.log('WAV file selected:', file.name, file.size);
                              setEditWavFile(file);
                            }
                          }}
                        />
                        {editWavFile ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-500" />
                              <span className="text-green-500 text-sm">{editWavFile.name}</span>
                            </div>
                            <button type="button" onClick={() => setEditWavFile(null)} className="text-gray-400 hover:text-white">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label htmlFor="edit-wav-file" className="cursor-pointer block text-white text-sm">
                            Click para seleccionar WAV
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Stems */}
                    <div>
                      <Label htmlFor="edit-stems-file" className="text-white">Nuevos Stems (RAR/ZIP)</Label>
                      <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                        editStemsFile ? 'border-green-500 bg-green-500/10' : 'border-gray-800/20 hover:border-white/50'
                      }`}>
                        <input
                          id="edit-stems-file"
                          type="file"
                          accept=".rar,.zip,application/x-rar-compressed,application/zip"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              console.log('Stems file selected:', file.name, file.size);
                              setEditStemsFile(file);
                            }
                          }}
                        />
                        {editStemsFile ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-500" />
                              <span className="text-green-500 text-sm">{editStemsFile.name}</span>
                            </div>
                            <button type="button" onClick={() => setEditStemsFile(null)} className="text-gray-400 hover:text-white">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label htmlFor="edit-stems-file" className="cursor-pointer block text-white text-sm">
                            Click para seleccionar RAR/ZIP
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Precios */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-priceBasica" className="text-white">Licencia Básica ($) *</Label>
                    <Input id="edit-priceBasica" name="priceBasica" type="number" step="0.01" value={editBeat.priceBasica}
                      onChange={handleEditInputChange} className="bg-black/50 border-gray-800/20 text-white" required />
                  </div>
                  <div>
                    <Label htmlFor="edit-pricePremium" className="text-white">Licencia Premium ($) *</Label>
                    <Input id="edit-pricePremium" name="pricePremium" type="number" step="0.01" value={editBeat.pricePremium}
                      onChange={handleEditInputChange} className="bg-black/50 border-gray-800/20 text-white" required />
                  </div>
                  <div>
                    <Label htmlFor="edit-priceExclusiva" className="text-white">Licencia Exclusiva ($) *</Label>
                    <Input id="edit-priceExclusiva" name="priceExclusiva" type="number" step="0.01" value={editBeat.priceExclusiva}
                      onChange={handleEditInputChange} className="bg-black/50 border-gray-800/20 text-white" required />
                  </div>
                </div>

                {/* Contratos de Licencia - Español (Edición) */}
                <div className="border-t border-gray-800/30 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-2">📄 Contratos de Licencia - Español</h3>
                  <p className="text-xs text-gray-400 mb-4">Dejar vacío para mantener los contratos actuales</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-white text-sm">Contrato Básica (ES)</Label>
                      <div className={`mt-2 border-2 border-dashed rounded-lg p-3 text-center transition-colors ${
                        editContractBasicaEs ? 'border-green-500 bg-green-500/10' : 'border-gray-800/20 hover:border-white/50'
                      }`}>
                        <input type="file" accept=".pdf" className="hidden" ref={editContractBasicaEsRef}
                          onChange={(e) => e.target.files?.[0] && setEditContractBasicaEs(e.target.files[0])} />
                        {editContractBasicaEs ? (
                          <div className="flex items-center justify-between">
                            <span className="text-green-500 text-xs truncate">{editContractBasicaEs.name}</span>
                            <button type="button" onClick={() => setEditContractBasicaEs(null)} className="text-gray-400 hover:text-white ml-2">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <label onClick={() => editContractBasicaEsRef.current?.click()} className="cursor-pointer block text-gray-400 text-xs">
                            {editingBeat?.contract_basica_es ? '✓ Tiene contrato' : 'Subir PDF'}
                          </label>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-white text-sm">Contrato Premium (ES)</Label>
                      <div className={`mt-2 border-2 border-dashed rounded-lg p-3 text-center transition-colors ${
                        editContractPremiumEs ? 'border-blue-500 bg-blue-500/10' : 'border-gray-800/20 hover:border-white/50'
                      }`}>
                        <input type="file" accept=".pdf" className="hidden" ref={editContractPremiumEsRef}
                          onChange={(e) => e.target.files?.[0] && setEditContractPremiumEs(e.target.files[0])} />
                        {editContractPremiumEs ? (
                          <div className="flex items-center justify-between">
                            <span className="text-blue-500 text-xs truncate">{editContractPremiumEs.name}</span>
                            <button type="button" onClick={() => setEditContractPremiumEs(null)} className="text-gray-400 hover:text-white ml-2">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <label onClick={() => editContractPremiumEsRef.current?.click()} className="cursor-pointer block text-gray-400 text-xs">
                            {editingBeat?.contract_premium_es ? '✓ Tiene contrato' : 'Subir PDF'}
                          </label>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-white text-sm">Contrato Exclusiva (ES)</Label>
                      <div className={`mt-2 border-2 border-dashed rounded-lg p-3 text-center transition-colors ${
                        editContractExclusivaEs ? 'border-yellow-500 bg-yellow-500/10' : 'border-gray-800/20 hover:border-white/50'
                      }`}>
                        <input type="file" accept=".pdf" className="hidden" ref={editContractExclusivaEsRef}
                          onChange={(e) => e.target.files?.[0] && setEditContractExclusivaEs(e.target.files[0])} />
                        {editContractExclusivaEs ? (
                          <div className="flex items-center justify-between">
                            <span className="text-yellow-500 text-xs truncate">{editContractExclusivaEs.name}</span>
                            <button type="button" onClick={() => setEditContractExclusivaEs(null)} className="text-gray-400 hover:text-white ml-2">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <label onClick={() => editContractExclusivaEsRef.current?.click()} className="cursor-pointer block text-gray-400 text-xs">
                            {editingBeat?.contract_exclusiva_es ? '✓ Tiene contrato' : 'Subir PDF'}
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contratos de Licencia - Inglés (Edición) */}
                <div className="border-t border-gray-800/30 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-2">📄 Contratos de Licencia - English</h3>
                  <p className="text-xs text-gray-400 mb-4">Leave empty to keep current contracts</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-white text-sm">Basic Contract (EN)</Label>
                      <div className={`mt-2 border-2 border-dashed rounded-lg p-3 text-center transition-colors ${
                        editContractBasicaEn ? 'border-green-500 bg-green-500/10' : 'border-gray-800/20 hover:border-white/50'
                      }`}>
                        <input type="file" accept=".pdf" className="hidden" ref={editContractBasicaEnRef}
                          onChange={(e) => e.target.files?.[0] && setEditContractBasicaEn(e.target.files[0])} />
                        {editContractBasicaEn ? (
                          <div className="flex items-center justify-between">
                            <span className="text-green-500 text-xs truncate">{editContractBasicaEn.name}</span>
                            <button type="button" onClick={() => setEditContractBasicaEn(null)} className="text-gray-400 hover:text-white ml-2">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <label onClick={() => editContractBasicaEnRef.current?.click()} className="cursor-pointer block text-gray-400 text-xs">
                            {editingBeat?.contract_basica_en ? '✓ Has contract' : 'Upload PDF'}
                          </label>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-white text-sm">Premium Contract (EN)</Label>
                      <div className={`mt-2 border-2 border-dashed rounded-lg p-3 text-center transition-colors ${
                        editContractPremiumEn ? 'border-blue-500 bg-blue-500/10' : 'border-gray-800/20 hover:border-white/50'
                      }`}>
                        <input type="file" accept=".pdf" className="hidden" ref={editContractPremiumEnRef}
                          onChange={(e) => e.target.files?.[0] && setEditContractPremiumEn(e.target.files[0])} />
                        {editContractPremiumEn ? (
                          <div className="flex items-center justify-between">
                            <span className="text-blue-500 text-xs truncate">{editContractPremiumEn.name}</span>
                            <button type="button" onClick={() => setEditContractPremiumEn(null)} className="text-gray-400 hover:text-white ml-2">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <label onClick={() => editContractPremiumEnRef.current?.click()} className="cursor-pointer block text-gray-400 text-xs">
                            {editingBeat?.contract_premium_en ? '✓ Has contract' : 'Upload PDF'}
                          </label>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-white text-sm">Exclusive Contract (EN)</Label>
                      <div className={`mt-2 border-2 border-dashed rounded-lg p-3 text-center transition-colors ${
                        editContractExclusivaEn ? 'border-yellow-500 bg-yellow-500/10' : 'border-gray-800/20 hover:border-white/50'
                      }`}>
                        <input type="file" accept=".pdf" className="hidden" ref={editContractExclusivaEnRef}
                          onChange={(e) => e.target.files?.[0] && setEditContractExclusivaEn(e.target.files[0])} />
                        {editContractExclusivaEn ? (
                          <div className="flex items-center justify-between">
                            <span className="text-yellow-500 text-xs truncate">{editContractExclusivaEn.name}</span>
                            <button type="button" onClick={() => setEditContractExclusivaEn(null)} className="text-gray-400 hover:text-white ml-2">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <label onClick={() => editContractExclusivaEnRef.current?.click()} className="cursor-pointer block text-gray-400 text-xs">
                            {editingBeat?.contract_exclusiva_en ? '✓ Has contract' : 'Upload PDF'}
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="bg-white hover:bg-gray-200 text-black" disabled={uploading}>
                    {uploading ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                  <Button type="button" variant="outline" className="border-gray-800/20 text-white" onClick={() => setShowEditForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Content based on active tab */}
        {activeTab === 'beats' && (
          <Card className="bg-black/50 border-gray-800/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Beats en Catálogo</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                </div>
              ) : beats.length === 0 ? (
                <div className="text-center py-12">
                  <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-white">No hay beats en el catálogo</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800/20">
                        <th className="text-left py-3 px-4 text-sm text-white">Beat</th>
                        <th className="text-left py-3 px-4 text-sm text-white">Género</th>
                        <th className="text-left py-3 px-4 text-sm text-white">BPM</th>
                        <th className="text-left py-3 px-4 text-sm text-white">Plays</th>
                        <th className="text-left py-3 px-4 text-sm text-white">Precio Base</th>
                        <th className="text-left py-3 px-4 text-sm text-white">Estado</th>
                        <th className="text-right py-3 px-4 text-sm text-white">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {beats.map((beat) => (
                        <tr key={beat.beat_id} className={`border-b border-gray-800/10 hover:bg-white/5 ${beat.is_hidden ? 'opacity-50' : ''}`}>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={`${API}/beats/cover/${beat.cover_filename || beat.cover_url?.split('/').pop()}?t=${Date.now()}`} 
                                alt={beat.name}
                                className="w-12 h-12 rounded object-cover"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/48'; }}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium text-white">{beat.name}</span>
                                {beat.is_hidden && (
                                  <span className="text-xs text-gray-400">(Oculto)</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-white">{beat.genre}</td>
                          <td className="py-4 px-4 text-white">{beat.bpm}</td>
                          <td className="py-4 px-4 text-white">{beat.plays || 0}</td>
                          <td className="py-4 px-4">
                            {beat.discount_percentage ? (
                              <div>
                                <span className="line-through text-gray-400 text-sm">${beat.price_basica}</span>
                                <span className="text-green-400 font-semibold ml-2">
                                  ${(beat.price_basica * (100 - beat.discount_percentage) / 100).toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-white font-semibold">${beat.price_basica}</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-1">
                              {beat.discount_percentage > 0 && (
                                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                                  -{beat.discount_percentage}%
                                </span>
                              )}
                              {beat.is_leaving_soon && (
                                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full border border-orange-500/30">
                                  Se va pronto
                                </span>
                              )}
                              {beat.is_hidden && (
                                <span className="px-2 py-0.5 bg-gray-500/20 text-white text-xs rounded-full border border-gray-500/30">
                                  Oculto
                                </span>
                              )}
                              {!(beat.discount_percentage > 0) && !beat.is_leaving_soon && !beat.is_hidden && (
                                <span className="text-white text-sm">Activo</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-1 flex-wrap">
                              {/* Descuento */}
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className={`border-gray-800/20 hover:bg-red-500 hover:border-red-500 hover:text-white ${beat.discount_percentage ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'text-white'}`}
                                onClick={() => openDiscountModal(beat)}
                                title="Descuento"
                              >
                                <Percent className="w-4 h-4" />
                              </Button>
                              {/* Se va pronto */}
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className={`border-gray-800/20 hover:bg-orange-500 hover:border-orange-500 hover:text-white ${beat.is_leaving_soon ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'text-white'}`}
                                onClick={() => handleToggleLeavingSoon(beat)}
                                title="Se va pronto"
                              >
                                <Clock className="w-4 h-4" />
                              </Button>
                              {/* Ocultar/Mostrar */}
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className={`border-gray-800/20 hover:bg-gray-500 hover:border-gray-500 hover:text-white ${beat.is_hidden ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'text-white'}`}
                                onClick={() => handleToggleVisibility(beat)}
                                title={beat.is_hidden ? "Mostrar" : "Ocultar"}
                              >
                                {beat.is_hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </Button>
                              {/* Editar */}
                              <Button size="sm" variant="outline" className="border-gray-800/20 text-white hover:bg-white hover:text-black"
                                onClick={() => handleEditBeat(beat)}
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              {/* Eliminar */}
                              <Button size="sm" variant="outline" className="border-gray-800/20 text-white hover:bg-white hover:text-black"
                                onClick={() => handleDeleteBeat(beat.beat_id, beat.name)}
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'sales' && (
          <Card className="bg-black/50 border-gray-800/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Historial de Ventas</CardTitle>
            </CardHeader>
            <CardContent>
              {sales.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-white">No hay ventas registradas</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800/20">
                        <th className="text-left py-3 px-4 text-sm text-white">Fecha</th>
                        <th className="text-left py-3 px-4 text-sm text-white">Beat</th>
                        <th className="text-left py-3 px-4 text-sm text-white">Comprador</th>
                        <th className="text-left py-3 px-4 text-sm text-white">Email</th>
                        <th className="text-left py-3 px-4 text-sm text-white">Licencia</th>
                        <th className="text-right py-3 px-4 text-sm text-white">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((sale, index) => (
                        <tr key={sale.payment_intent_id || index} className="border-b border-gray-800/10 hover:bg-white/5">
                          <td className="py-4 px-4 text-white text-sm">
                            {formatDate(sale.created_at)}
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-medium text-white">{sale.beat_name}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-white">{sale.buyer_name || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-white">{sale.buyer_email}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${licenseColors[sale.license_type] || 'bg-gray-500/20 text-gray-400'}`}>
                              {sale.license_type === 'exclusiva' && '⭐ '}
                              {sale.license_type?.charAt(0).toUpperCase() + sale.license_type?.slice(1)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="text-green-500 font-bold">${sale.amount?.toFixed(2)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'genres' && (
          <Card className="bg-black/50 border-gray-800/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Tag className="w-5 h-5 text-white" />
                Gestión de Géneros
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add Genre Form */}
              <form onSubmit={handleAddGenre} className="flex gap-4 mb-8">
                <Input
                  type="text"
                  placeholder="Nombre del género (ej: Trap, Reggaeton, Soul...)"
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  className="flex-1 bg-black/50 border-gray-800/20 text-white placeholder:text-gray-400"
                />
                <Button 
                  type="submit" 
                  className="bg-white hover:bg-gray-200 text-black"
                  disabled={addingGenre || !newGenre.trim()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {addingGenre ? 'Agregando...' : 'Agregar Género'}
                </Button>
              </form>

              {/* Info */}
              <div className="bg-black/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-white">
                  <strong className="text-white">Nota:</strong> Los géneros se normalizan automáticamente (ej: "trap", "TRAP", "Trap" se convierten en "Trap"). 
                  Estos géneros aparecerán en el formulario de subir beats y en los filtros del catálogo.
                </p>
              </div>

              {/* Genres List */}
              {genres.length === 0 ? (
                <div className="text-center py-12">
                  <Tag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-white">No hay géneros registrados</p>
                  <p className="text-gray-300 text-sm mt-2">Agrega tu primer género arriba</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {genres.map((genre) => (
                    <div 
                      key={genre.genre_id} 
                      className="flex items-center justify-between bg-black/50 border border-gray-800/20 rounded-lg px-4 py-3 hover:border-gray-200/50 transition-colors"
                    >
                      <span className="font-medium text-white">{genre.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:text-white400 hover:bg-gray-900/20 p-1 h-auto"
                        onClick={() => handleDeleteGenre(genre.genre_id, genre.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de Descuento */}
      {showDiscountModal && discountBeat && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="bg-black/90 border-gray-800/20 backdrop-blur-sm w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Percent className="w-5 h-5 text-red-400" />
                  Aplicar Descuento
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowDiscountModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-black/50 rounded-lg">
                <img 
                  src={`${API}/beats/cover/${discountBeat.cover_filename || discountBeat.cover_url?.split('/').pop()}`}
                  alt={discountBeat.name}
                  className="w-12 h-12 rounded object-cover"
                />
                <div>
                  <p className="font-semibold text-white">{discountBeat.name}</p>
                  <p className="text-sm text-white">Precio base: ${discountBeat.price_basica}</p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="discount-percentage" className="text-white">Porcentaje de descuento</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    id="discount-percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    className="bg-black/50 border-gray-800/20 text-white"
                    placeholder="Ej: 20"
                  />
                  <span className="text-xl text-white">%</span>
                </div>
                <p className="text-xs text-gray-300 mt-1">Ingresa 0 para quitar el descuento</p>
              </div>
              
              {discountPercentage && parseInt(discountPercentage) > 0 && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400 font-semibold mb-1">Vista previa:</p>
                  <div className="flex items-center gap-3">
                    <span className="line-through text-gray-400">${discountBeat.price_basica}</span>
                    <span className="text-green-400 font-bold text-xl">
                      ${(discountBeat.price_basica * (100 - parseInt(discountPercentage)) / 100).toFixed(2)}
                    </span>
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      DESCUENTO DE {discountPercentage}%
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 pt-2">
                <Button 
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  onClick={handleApplyDiscount}
                >
                  {discountPercentage && parseInt(discountPercentage) > 0 ? 'Aplicar Descuento' : 'Quitar Descuento'}
                </Button>
                <Button 
                  variant="outline" 
                  className="border-gray-800/20 text-white"
                  onClick={() => setShowDiscountModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
