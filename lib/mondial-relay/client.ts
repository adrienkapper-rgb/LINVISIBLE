import * as soap from 'soap'
import crypto from 'crypto'

interface PointRelais {
  Num: string
  LgAdr1: string
  LgAdr2?: string
  LgAdr3: string
  LgAdr4?: string
  CP: string
  Ville: string
  Pays: string
  Latitude: string
  Longitude: string
  TypeActivite: string
  Information?: string
  Localisation1?: string
  Localisation2?: string
  Horaires_Lundi?: { string: string[] }
  Horaires_Mardi?: { string: string[] }
  Horaires_Mercredi?: { string: string[] }
  Horaires_Jeudi?: { string: string[] }
  Horaires_Vendredi?: { string: string[] }
  Horaires_Samedi?: { string: string[] }
  Horaires_Dimanche?: { string: string[] }
  Informations_Dispo?: string
  URL_Photo?: string
  URL_Plan?: string
  Distance?: string
  STAT?: string
}

interface MondialRelayConfig {
  codeEnseigne: string
  privateKey: string
  pays: string
  mode: 'TEST' | 'PRODUCTION'
}

interface WSI4Response {
  WSI4_PointRelais_RechercheResult?: {
    STAT?: string
    PointsRelais?: {
      PointRelais_Details?: PointRelais | PointRelais[]
    }
  }
}

export class MondialRelayClient {
  private config: MondialRelayConfig
  private wsdlUrl: string

  constructor() {
    this.config = {
      codeEnseigne: process.env.MONDIAL_RELAY_CODE_ENSEIGNE!,
      privateKey: process.env.MONDIAL_RELAY_PRIVATE_KEY!,
      pays: process.env.MONDIAL_RELAY_PAYS || 'FR',
      mode: (process.env.MONDIAL_RELAY_MODE as 'TEST' | 'PRODUCTION') || 'TEST'
    }
    
    // URL WSDL pour l'API Mondial Relay
    this.wsdlUrl = 'https://api.mondialrelay.com/Web_Services.asmx?WSDL'
  }

  private generateSecurityKey(params: Record<string, string>): string {
    // Créer la chaîne pour le hash MD5 selon la documentation Mondial Relay
    let paramString = ''
    
    // L'ordre des paramètres est important pour la signature
    const orderedKeys = [
      'Enseigne',
      'Pays', 
      'Ville',
      'CP',
      'Latitude',
      'Longitude',
      'Taille',
      'Poids',
      'Action',
      'DelaiEnvoi',
      'RayonRecherche',
      'TypeActivite',
      'NACE',
      'NombreResultats'
    ]
    
    // Ajouter les valeurs dans l'ordre
    orderedKeys.forEach(key => {
      if (params[key] !== undefined) {
        paramString += params[key]
      }
    })
    
    // Ajouter la clé privée à la fin
    paramString += this.config.privateKey

    // Calculer le hash MD5 en majuscules
    return crypto.createHash('md5').update(paramString, 'utf8').digest('hex').toUpperCase()
  }

  async searchPointsRelais(params: {
    codePostal: string
    ville?: string
    pays?: string
    nbResultats?: number
    rayonRecherche?: number
  }): Promise<{ success: boolean; data?: PointRelais[]; error?: string }> {
    try {
      console.log('Création du client SOAP pour:', this.wsdlUrl)
      
      // Créer le client SOAP
      const client = await soap.createClientAsync(this.wsdlUrl, {
        endpoint: 'https://api.mondialrelay.com/Web_Services.asmx',
        forceSoap12Headers: false
      })

      // Paramètres pour WSI4_PointRelais_Recherche
      const requestParams: Record<string, string> = {
        Enseigne: this.config.codeEnseigne,
        Pays: params.pays || this.config.pays,
        Ville: params.ville || '',
        CP: params.codePostal,
        Latitude: '',
        Longitude: '',
        Taille: '',
        Poids: '',
        Action: '',
        DelaiEnvoi: '0',
        RayonRecherche: (params.rayonRecherche || 20).toString(),
        TypeActivite: '',
        NACE: '',
        NombreResultats: (params.nbResultats || 10).toString()
      }

      // Générer la clé de sécurité
      const security = this.generateSecurityKey(requestParams)
      
      // Ajouter la sécurité aux paramètres
      const finalParams = {
        ...requestParams,
        Security: security
      }

      console.log('Appel WSI4_PointRelais_Recherche avec params:', {
        ...finalParams,
        Security: '***' // Masquer la clé dans les logs
      })

      // Appeler la méthode SOAP
      const [result] = await client.WSI4_PointRelais_RechercheAsync(finalParams) as [WSI4Response]
      
      console.log('Réponse SOAP reçue:', JSON.stringify(result, null, 2))

      // Vérifier le statut de la réponse
      const wsResult = result?.WSI4_PointRelais_RechercheResult
      
      if (!wsResult) {
        console.error('Pas de résultat dans la réponse')
        return { success: false, error: 'Pas de réponse du service' }
      }

      const stat = wsResult.STAT
      
      // Codes de statut Mondial Relay
      if (stat && stat !== '0') {
        const errorMessages: Record<string, string> = {
          '1': 'Enseigne invalide',
          '2': 'Numéro d\'enseigne vide ou inexistant',
          '3': 'Numéro de compte enseigne invalide',
          '5': 'Numéro de dossier enseigne invalide',
          '7': 'Numéro de client enseigne invalide', 
          '8': 'Mot de passe ou hachage invalide',
          '9': 'Ville non reconnu ou non unique',
          '10': 'Type de collecte invalide ou incorrect',
          '11': 'Numéro de Point Relais invalide',
          '12': 'Pays du Point Relais invalide',
          '13': 'Type de livraison invalide',
          '14': 'Poids invalide',
          '15': 'Taille invalide',
          '20': 'Parcel shop inexistant',
          '21': 'Parcel shop fermé',
          '22': 'Parcel shop invalide',
          '24': 'Numéro de colis invalide',
          '26': 'Temps de montage invalide',
          '27': 'Mode de collecte ou de livraison invalide',
          '28': 'Mode de collecte invalide',
          '29': 'Mode de livraison invalide',
          '30': 'Adresse invalide',
          '31': 'Adresse vide',
          '33': 'Adresse introuvable',
          '34': 'Erreur ID site',
          '35': 'Erreur numero site non référencé',
          '36': 'Erreur référent absent',
          '37': 'Erreur nombre de colis',
          '38': 'Erreur nombre total de colis',
          '39': 'Erreur montage non effectué',
          '40': 'Erreur mode de livraison',
          '42': 'Erreur montage invalide',
          '43': 'Erreur numéro de bordereau',
          '44': 'Erreur nom de fichier invalide',
          '45': 'Erreur de création de fichier',
          '46': 'Erreur type d\'étiquette invalide',
          '47': 'Nombre d\'étiquettes invalide',
          '48': 'Erreur parcel shop en relais',
          '49': 'Erreur parcel shop fermé',
          '60': 'Champ texte libre invalide',
          '61': 'Consigne non valide',
          '62': 'Info consigne invalide',
          '63': 'Assurance invalide',
          '64': 'Temps de montage invalide',
          '65': 'Montant invalide',
          '66': 'Valeur déclarée invalide',
          '67': 'Longueur déclarée invalide',
          '68': 'Taille déclarée invalide',
          '69': 'Poids invalide',
          '70': 'Parcel shop invalide',
          '71': 'Nature de Point de montage invalide',
          '72': 'Langue invalide',
          '73': 'Devise invalide',
          '74': 'Incohérence entre le mode de livraison et le code pays du destinataire',
          '78': 'Coordonnées GPS invalides',
          '79': 'Coordonnées invalides',
          '80': 'Code tracing : colis retourné',
          '81': 'Code tracing : colis en cours de retour',
          '82': 'Code tracing : Commande traitée',
          '83': 'Code tracing : Aucune commande passée',
          '84': 'Numéro de relais invalide',
          '85': 'Action invalide',
          '86': 'Délai invalide',
          '87': 'Rayon invalide',
          '88': 'Code type activité invalide',
          '89': 'Code NACE invalide',
          '93': 'Aucun élément retourné par le webservice',
          '94': 'Colis Inexistant',
          '95': 'Compte Enseigne non activé',
          '96': 'Type d\'enseigne incorrect',
          '97': 'Clé de sécurité invalide',
          '98': 'Erreur générique',
          '99': 'Erreur générique du service'
        }
        
        const errorMessage = errorMessages[stat] || `Erreur inconnue (code: ${stat})`
        console.error(`Erreur Mondial Relay: ${errorMessage}`)
        return { success: false, error: errorMessage }
      }

      // Extraire les points relais
      const pointsRelaisData = wsResult.PointsRelais?.PointRelais_Details
      
      if (!pointsRelaisData) {
        console.log('Aucun point relais trouvé')
        return { success: true, data: [] }
      }

      // Normaliser en tableau
      const pointsRelais = Array.isArray(pointsRelaisData) 
        ? pointsRelaisData 
        : [pointsRelaisData]

      console.log(`${pointsRelais.length} point(s) relais trouvé(s)`)

      // Formater les horaires si présents
      const formattedPoints = pointsRelais.map(point => {
        // Convertir les horaires qui peuvent être dans un format spécial
        const formatHoraires = (horaires: any) => {
          if (horaires?.string && Array.isArray(horaires.string)) {
            return horaires.string.join(' ')
          }
          return horaires || ''
        }

        return {
          ...point,
          Horaires_Lundi: formatHoraires(point.Horaires_Lundi),
          Horaires_Mardi: formatHoraires(point.Horaires_Mardi),
          Horaires_Mercredi: formatHoraires(point.Horaires_Mercredi),
          Horaires_Jeudi: formatHoraires(point.Horaires_Jeudi),
          Horaires_Vendredi: formatHoraires(point.Horaires_Vendredi),
          Horaires_Samedi: formatHoraires(point.Horaires_Samedi),
          Horaires_Dimanche: formatHoraires(point.Horaires_Dimanche),
        }
      })

      return {
        success: true,
        data: formattedPoints
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'appel SOAP:', error)
      
      // Vérifier si c'est une erreur SOAP
      if (error && typeof error === 'object' && 'root' in error) {
        const soapError = error as any
        if (soapError.root?.Envelope?.Body?.Fault) {
          const fault = soapError.root.Envelope.Body.Fault
          return { 
            success: false, 
            error: `Erreur SOAP: ${fault.faultstring || fault.faultcode || 'Erreur inconnue'}` 
          }
        }
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'appel au service' 
      }
    }
  }
}