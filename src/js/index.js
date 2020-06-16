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


const controlSearch = async () => {
    //1. Get query from view
    const query = searchView.getInput();
    if(query){
    
    //2. New search object and add it to state
        state.search = new Search(query);
    //3. Prepare UI for results
            searchView.clearInput();
            searchView.clearResults();
            renderLoader(elements.searchRes);
        try{
        //4. Search for recipes
        await  state.search.getResults();
        //5. render results on UI
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


/*
*RECIPE CONTROLLER 
*/


const controlRecipe = async () => {
    const id = window.location.hash.replace('#','');
    if(id)
    {
        //Prepare ui for changes
       recipeView.clearRecipe();
        renderLoader(elements.recipe);
       //Highlight selected seatch item
      if(state.search)
       searchView.highlightSelected(id);

        //Create new recipe object 
        state.recipe = new Recipe(id);
      
        //Get recipe data
        try{ 
            await  state.recipe.getRecipe();
            state.recipe.parseIngredients();
            //Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();
            //Render recipe
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
    
    //Create a new list If there is none yet
    
    if(!state.list)
        state.list = new List();

    //Add each ingredient to the list and UI

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
    {   
        //Delete from state
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
 
const controlLike = () => {
   
    const currentID = state.recipe.id;
    //if(!state.likes)
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
        likesView.renderLike(newLike);
    }
    
    //User has liked the recipe
    
    else{
            //Remove like from the state
            state.likes.deleteLike(currentID);
            //Toggle the like button
            likesView.toggleLikeBtn(false);
            //Remove like from UI 
            likesView.deleteLike(currentID);
      //      console.log(state.likes);
    }
    
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    
};

//Restore the recipes on page load

window.addEventListener('load',() => {
    state.likes = new Likes();
    //Restore likes
    state.likes.readStorage();
    //Toggle likes menu button 
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    //Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
    });
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
});

