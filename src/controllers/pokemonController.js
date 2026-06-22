import * as pokemonService from '../services/pokemonService.js';

// ============================================
// VIEW CONTROLLERS (Return HTML via EJS)
// ============================================

/**
 * Home page - List all Pokemon with pagination (With safety timeout protection)
 */
export const getHomePage = async (req, res) => {
  try {
    console.log('=== DEBUG: Entering getHomePage controller ===');

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    // Create a 3-second timeout so the browser NEVER hangs blank forever
    const timeout = new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              "The service layer timed out while trying to fetch Pokemon data! Ensure pokemonService.js or pokemonRepository.js isn't caught in a loop."
            )
          ),
        3000
      )
    );

    // Race the data fetch against the 3-second timer
    const [data, types] = await Promise.race([
      Promise.all([pokemonService.getAllPokemon(page, limit), pokemonService.getPokemonTypes()]),
      timeout
    ]);

    console.log('=== DEBUG: Service successfully returned data ===');

    res.render('index', {
      ...data,
      types,
      searchQuery: '',
      selectedType: ''
    });
  } catch (error) {
    console.error('=== DEBUG ERROR IN CONTROLLER ===', error.message);
    // Send a readable error message directly to the screen so we can diagnose the data layer
    res.status(500).send(`
      <div style="padding: 20px; font-family: monospace; background: #fee; color: #b11; border: 1px solid #ecc;">
        <h2>Failed to load Pokemon</h2>
        <p><strong>Error Message:</strong> ${error.message}</p>
        <p><em>Check your console or repository layer functions for unresolved promises or infinite loops.</em></p>
      </div>
    `);
  }
};

/**
 * Pokemon detail page
 */
export const getPokemonDetails = async (req, res) => {
  try {
    const { nameOrId } = req.params;
    const pokemon = await pokemonService.getPokemonDetails(nameOrId);

    if (!pokemon) {
      return res.status(404).render('error', {
        message: 'Pokemon not found',
        error: `No Pokemon found with name or ID: ${nameOrId}`
      });
    }

    res.render('pokemon', { pokemon });
  } catch (error) {
    res.status(500).render('error', {
      message: 'Failed to load Pokemon details',
      error: error.message
    });
  }
};

/**
 * Search results page
 */
export const searchPokemon = async (req, res) => {
  try {
    const { q } = req.query;
    const types = await pokemonService.getPokemonTypes();
    const data = await pokemonService.searchPokemon(q);

    res.render('index', {
      ...data,
      types,
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
      searchQuery: q || '',
      selectedType: ''
    });
  } catch (error) {
    res.status(500).render('error', {
      message: 'Search failed',
      error: error.message
    });
  }
};

/**
 * Filter by type page
 */
export const getPokemonByType = async (req, res) => {
  try {
    const { type } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const types = await pokemonService.getPokemonTypes();
    const data = await pokemonService.getPokemonByType(type, page);

    if (!data) {
      return res.status(404).render('error', {
        message: 'Type not found',
        error: `No Pokemon type found: ${type}`
      });
    }

    res.render('index', {
      ...data,
      types,
      searchQuery: '',
      selectedType: type
    });
  } catch (error) {
    res.status(500).render('error', {
      message: 'Failed to load Pokemon by type',
      error: error.message
    });
  }
};

// ============================================
// API CONTROLLERS (Return JSON)
// ============================================

/**
 * API: Get all Pokemon
 */
export const apiGetAllPokemon = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const data = await pokemonService.getAllPokemon(page, limit);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * API: Get Pokemon by name or ID
 */
export const apiGetPokemonDetails = async (req, res) => {
  try {
    const { nameOrId } = req.params;
    const pokemon = await pokemonService.getPokemonDetails(nameOrId);

    if (!pokemon) {
      return res.status(404).json({
        success: false,
        error: `Pokemon not found: ${nameOrId}`
      });
    }

    res.json({ success: true, data: pokemon });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * API: Search Pokemon
 */
export const apiSearchPokemon = async (req, res) => {
  try {
    const { q } = req.query;
    const data = await pokemonService.searchPokemon(q);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * API: Get all types
 */
export const apiGetTypes = async (_req, res) => {
  try {
    const types = await pokemonService.getPokemonTypes();
    res.json({ success: true, data: types });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * API: Get Pokemon by type
 */
export const apiGetPokemonByType = async (req, res) => {
  try {
    const { type } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const data = await pokemonService.getPokemonByType(type, page);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: `Type not found: ${type}`
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
