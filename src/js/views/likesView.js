import { elements } from './base';
export const toggleLikeBtn = isLiked => {
    const iconString = isLikes ? 'icon-heart' : 'icon-heart-outlined';
    document.querySelector('.recipe__love use').setAttribute('href',`img/icons.svg#${iconString}`);
    console.log(document.querySelector('.recipe__love use'));
};