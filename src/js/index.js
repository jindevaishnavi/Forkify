import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import { elements, renderLoader,clearLoader } from './views/base';

/**Global state of the app
 -->Search objecct
--> Current recipe object
--> shopping list object
 --> liked recipes
state will be made persistent for later

 */
/**
 * SEARCH CONTROLLER
 */
const state = {};
const controlSearch = async () => {
    //1 ) get query from view
    const query = searchView.getInput();
    //console.log(query);
  //  console.log(query);//todo
    if(query){
        // 2) new search object and add it to state
        state.search = new Search(query);
        // 3) Prepare UI for results
            searchView.clearInput();
            searchView.clearResults();
            renderLoader(elements.searchRes);
            try{
        // 4) Search for recipes
      await  state.search.getResults();
        //5) render results on UI
        clearLoader();
    searchView.renderResults(state.search.result);
            }
            catch(err)
            {
                alert('something wrong with the search');
            }
    }
}
elements.searchForm.addEventListener('submit', e =>{
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e=>{
const btn = e.target.closest('.btn-inline');
if(btn)
{
    const goToPage = parseInt(btn.dataset.goto,10);
    searchView.clearResults();
    searchView.renderResults(state.search.result,goToPage);
    
}
});




//controller all controllers are in index.js and is easier to put them in one
//what is the state of out website,current moment, all the data has to be at one object ,Redux : state management library 
// in redux its called store
/**RECIPE CONTROLLER */
const controlRecipe = async () => {
    const id = window.location.hash.replace('#','');
    console.log(id);
    if(id)
    {
        //prepare ui for changes
       recipeView.clearRecipe();
        renderLoader(elements.recipe);
       
        //create new recipe object 
        state.recipe = new Recipe(id);
      
        // get recipe data
     try{ 
         await  state.recipe.getRecipe();
        console.log(state.recipe.ingredients);
        state.recipe.parseIngredients();
      
        //calculate servings and time
        state.recipe.calcTime();
        state.recipe.calcServings();
        //render recipe
        clearLoader();
        recipeView.renderRecipe(state.recipe);
        
     }
     catch(err) {
            alert('Error processing recipe!');
     }
    }


};


['hashchange','load'].forEach(event => window.addEventListener(event,controlRecipe));