import { getPokemonDetails } from './src/services/pokemonService.js';

async function runTest() {
  console.log('Testing Service: Formatting Pikachu...');
  const data = await getPokemonDetails('pikachu');
  if (data) {
    console.log(`Success! Name: ${data.displayName}`);
    console.log(`Height: ${data.height}m (Expected: 0.4m)`);
    console.log(`Weight: ${data.weight}kg (Expected: 6kg)`);
    console.log(`Description: ${data.description.substring(0, 60)}...`);
  } else {
    console.log('Service returned null.');
  }
}
runTest();