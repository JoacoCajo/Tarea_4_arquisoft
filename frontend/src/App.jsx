import React, { useState, useRef, useEffect } from 'react';
import { Calculator, TrendingUp, Sigma, Send, Trash2 } from 'lucide-react';

// Configuración de la API
const API_BASE_URL = 'http://localhost:8003/api/v1';

const solveEquation = async (query) => {
  const response = await fetch(`${API_BASE_URL}/solve/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!response.ok) throw new Error('Error al resolver la ecuación');
  return response.json();
};

const calculateIntegral = async (query) => {
  const response = await fetch(`${API_BASE_URL}/integrate/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!response.ok) throw new Error('Error al calcular la integral');
  return response.json();
};

const calculateDerivative = async (query) => {
  const response = await fetch(`${API_BASE_URL}/differentiate/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!response.ok) throw new Error('Error al calcular la derivada');
  return response.json();
};

export default function MathChatbot() {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: '¡Hola! Soy tu asistente matemático. Puedo ayudarte a:',
      options: ['Resolver ecuaciones', 'Calcular derivadas', 'Calcular integrales']
    }
  ]);
  const [input, setInput] = useState('');
  const [operation, setOperation] = useState('solve');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      type: 'user',
      content: input,
      operation
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      let result;
      
      if (operation === 'solve') {
        result = await solveEquation(input);
        setMessages(prev => [...prev, {
          type: 'bot',
          content: `Solución: ${result.solution.join(', ')}`,
          details: { query: result.query, solution: result.solution }
        }]);
      } else if (operation === 'integrate') {
        result = await calculateIntegral(input);
        setMessages(prev => [...prev, {
          type: 'bot',
          content: `Integral: ${result.result}`,
          details: { query: result.query, result: result.result }
        }]);
      } else if (operation === 'differentiate') {
        result = await calculateDerivative(input);
        setMessages(prev => [...prev, {
          type: 'bot',
          content: `Derivada: ${result.result}`,
          details: { query: result.query, result: result.result }
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: `Error: ${error.message || 'No se pudo procesar la operación'}`,
        isError: true
      }]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const clearChat = () => {
    setMessages([{
      type: 'bot',
      content: '¡Hola! Soy tu asistente matemático. Puedo ayudarte a:',
      options: ['Resolver ecuaciones', 'Calcular derivadas', 'Calcular integrales']
    }]);
  };

  const getOperationIcon = () => {
    switch(operation) {
      case 'solve': return <Calculator className="w-4 h-4" />;
      case 'integrate': return <Sigma className="w-4 h-4" />;
      case 'differentiate': return <TrendingUp className="w-4 h-4" />;
      default: return <Calculator className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ height: '90vh' }}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calculator className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Math Chatbot</h1>
                <p className="text-blue-100 text-sm">Asistente de matemáticas con IA</p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Limpiar chat"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.isError
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : 'bg-white text-gray-800 shadow-md'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {message.options && (
                  <div className="mt-3 space-y-2">
                    {message.options.map((option, idx) => (
                      <div key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                        {option}
                      </div>
                    ))}
                  </div>
                )}

                {message.details && (
                  <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                    <strong>Entrada:</strong> {message.details.query}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white px-4 py-3 rounded-2xl shadow-md">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t bg-white p-4">
          {/* Operation Selector */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setOperation('solve')}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                operation === 'solve'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calculator className="w-4 h-4" />
              Resolver
            </button>
            <button
              onClick={() => setOperation('integrate')}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                operation === 'integrate'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Sigma className="w-4 h-4" />
              Integrar
            </button>
            <button
              onClick={() => setOperation('differentiate')}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                operation === 'differentiate'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Derivar
            </button>
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {getOperationIcon()}
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ej: x**2 - 4, 2*x + 5, sin(x)"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                disabled={loading}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Enviar
            </button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-gray-500 mt-2 text-center">
            Usa notación Python: ** para potencias, * para multiplicación, / para división
          </p>
        </div>
      </div>
    </div>
  );
}