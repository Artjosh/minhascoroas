import { useRouter } from 'next/router';
import { useEffect, useState, createContext, useContext } from 'react';

// Contexto para disponibilizar os parâmetros UTM em toda a aplicação
const UtmContext = createContext({
  utmSource: '',
  utmMedium: '',
  utmCampaign: '',
  utmTerm: '',
  utmContent: '',
  redirectWithUtm: () => {},
});

// Hook personalizado para acessar os parâmetros UTM
export const useUtmParams = () => useContext(UtmContext);

// Componente Provider que gerencia os parâmetros UTM
export const UtmProvider = ({ children }) => {
  const router = useRouter();
  const [utmParams, setUtmParams] = useState({
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    utmTerm: '',
    utmContent: '',
  });

  // Extrai os parâmetros UTM da URL e os armazena no estado
  useEffect(() => {
    if (!router.isReady) return;

    const { utm_source, utm_medium, utm_campaign, utm_term, utm_content } = router.query;

    setUtmParams({
      utmSource: utm_source || '',
      utmMedium: utm_medium || '',
      utmCampaign: utm_campaign || '',
      utmTerm: utm_term || '',
      utmContent: utm_content || '',
    });

    // Armazena os parâmetros UTM no localStorage para persistência
    if (utm_source || utm_medium || utm_campaign || utm_term || utm_content) {
      localStorage.setItem('utmParams', JSON.stringify({
        utmSource: utm_source || '',
        utmMedium: utm_medium || '',
        utmCampaign: utm_campaign || '',
        utmTerm: utm_term || '',
        utmContent: utm_content || '',
      }));
    }
  }, [router.isReady, router.query]);

  // Carrega os parâmetros UTM do localStorage ao iniciar a aplicação
  useEffect(() => {
    const savedUtmParams = localStorage.getItem('utmParams');
    if (savedUtmParams) {
      try {
        const parsedParams = JSON.parse(savedUtmParams);
        setUtmParams(parsedParams);
      } catch (error) {
        console.error('Erro ao parsear parâmetros UTM:', error);
      }
    }
  }, []);

  // Função para redirecionar mantendo os parâmetros UTM
  const redirectWithUtm = (path) => {
    const query = {};
    
    // Adiciona os parâmetros UTM ao objeto de query se existirem
    if (utmParams.utmSource) query.utm_source = utmParams.utmSource;
    if (utmParams.utmMedium) query.utm_medium = utmParams.utmMedium;
    if (utmParams.utmCampaign) query.utm_campaign = utmParams.utmCampaign;
    if (utmParams.utmTerm) query.utm_term = utmParams.utmTerm;
    if (utmParams.utmContent) query.utm_content = utmParams.utmContent;

    // Se houver parâmetros UTM, redireciona com eles, caso contrário, redireciona normalmente
    if (Object.keys(query).length > 0) {
      router.push({
        pathname: path,
        query,
      });
    } else {
      router.push(path);
    }
  };

  return (
    <UtmContext.Provider value={{ ...utmParams, redirectWithUtm }}>
      {children}
    </UtmContext.Provider>
  );
};

export default UtmProvider;
