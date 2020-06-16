import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
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

window.state = state;


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
       //highlight selected seatch item
      if(state.search)
       searchView.highlightSelected(id);

        //create new recipe object 
        state.recipe = new Recipe(id);
      

        // get recipe data
     try{ 
         await  state.recipe.getRecipe();
      //  console.log(state.recipe.ingredients);
        state.recipe.parseIngredients();
      
        //calculate servings and time
        state.recipe.calcTime();
        state.recipe.calcServings();
        //render recipe
        clearLoader();
        recipeView.renderRecipe(state.recipe,
            state.likes.isLiked(id));
       
     }
     catch(err) {
            alert('Error processing recipe!');
     }
    }


};


['hashchange','load'].forEach(event => window.addEventListener(event,controlRecipe));

/**
 * 
 * LIST CONTROLLER
 * 
 */
const controlList = () => {
    //create a new list IF there is none yet
    if(!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
             const item = state.list.addItem(el.count,el.unit,el.ingredient);
                listView.renderItem(item);
            });
        
}
//Handle update and delete list item 

elements.shopping.addEventListener('click', e => {
const id = e.target.closest('.shopping__item').dataset.itemid;
//  Handle the delete button

if(e.target.matches('.shopping__delete, .shopping__delete *'))

{   //delete
    state.list.deleteItem(id);
    //delete from UI
    listView.deleteItem(id);
}
//Handle the count
else if(e.target.matches('.shopping__count-value')){
    const val =parseFloat(e.target.value,10);
   
    state.list.updateCount(id,val);
    
}
});


/**
 * LIKE CONTROLLER
 */
//TESTING
 state.likes = new Likes();
const controlLike = () => {
    
    const currentID = state.recipe.id;
    if(!state.likes)
    //User has not not yet liked the recipe 
    if(!state.likes.isLiked(currentID))
    {
        //Add  like to the state
        const newLike = state.likes.addLike(currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
            );
        //Toggle the like button
        likesView.toggleLikeBtn(true);
        //Add like to the UI list
            console.log(state.likes);
    }
    //User has liked
    else{
            //Remove like from the state
            state.likes.deleteLike(currentID);
            //Toggle the like button
            likesView.toggleLikeBtn(false);
            //Remove like from UI 
            console.log(state.likes);
    }

    }

//Handling recipe button clicks

elements.recipe.addEventListener('click', e=> {
if(e.target.matches('.btn-decrease, .btn-decrease *')){
    if(state.recipe.servings > 1)
    state.recipe.updateServings('dec');
    recipeView.updateServingsIngredients(state.recipe);
}
else if(e.target.matches('.btn-increase, .btn-increase *')){
state.recipe.updateServings('inc');
recipeView.updateServingsIngredients(state.recipe);
}
else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *'))
 {  //ADD TO SHOPPING LIST
     controlList();
 }
 else if (e.target.matches('.recipe__love, .recipe__love *'))
 {
    //Like controller
    controlLike();
 }
//console.log(state.recipe);
});

window.l  = new List();
