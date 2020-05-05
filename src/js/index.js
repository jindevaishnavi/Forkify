import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
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
        // 4) Search for recipes
      await  state.search.getResults();
        //5) render results on UI
        clearLoader();
    searchView.renderResults(state.search.result);
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
const controlRecipe = () => {
    const id = window.location.hash;
    console.log(id);
};


window.addEventListener('hashchange',controlRecipe);