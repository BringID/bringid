  import TMode from '../types/mode'
  import api from './api'

  type TRegistryConfig = {
    REGISTRY: string
    CHAIN_ID: string
  }

  async function fetchRegistryConfig(mode: TMode): Promise<TRegistryConfig | null> {

    try {
      const configsFileName = mode === 'dev' ? 'dev-configs-staging' : 'configs'
      const configs = await api<TRegistryConfig>(
        `https://raw.githubusercontent.com/BringID/configs/main/${configsFileName}.json`
      )
      return {
        REGISTRY: configs.REGISTRY,
        CHAIN_ID: configs.CHAIN_ID
      }
    } catch (err) {
      console.error(err)
      return null
    }
    
  }

  export default fetchRegistryConfig