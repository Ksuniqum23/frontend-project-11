import state from "./state";
import {updateUI} from "../view/render";

const parseFeed = (xmlDoc) => {
    const channelTitle = xmlDoc.querySelector('channel > title')?.textContent || 'Без заголовка';
    const channelDescription = xmlDoc.querySelector('channel > description')?.textContent || 'Без описания';
    return {
        title: channelTitle,
        description: channelDescription
    };
}

const parsePosts = (xmlDoc) => {
    const postOrderArr = [];
    const postsPool = {};

    xmlDoc.querySelectorAll('item').forEach(item => {
        const postLink = item.querySelector('link')?.textContent;
        if (!postLink || state.data.posts[postLink]) {
            return;
        }
        postsPool[postLink] = {
            title: item.querySelector('title')?.textContent || 'Нет заголовка',
            description: item.querySelector('description').textContent || 'Нет описания',
            link: postLink,
        };
        postOrderArr.push(postLink);
    });
    return { postOrderArr, postsPool };
};

export const addNewRssInState = (xmlDoc, rssLink) => {
    state.data.feeds[rssLink] = parseFeed(xmlDoc);
    const posts = parsePosts(xmlDoc);
    Object.assign(state.data.posts, posts.postsPool);
    state.ui.rssLinksOrder.push(rssLink);
    state.ui.postsOrder[rssLink] = posts.postOrderArr;
    console.log(state);
    updateUI(state);
};

export const addNewPostsInState= (rssLink, postsLinksArr, xmlDoc) => {
    xmlDoc.querySelectorAll('item').forEach(item => {
        const itemLink =  item.querySelector('link')?.textContent;
        if (postsLinksArr.includes(itemLink)) {
            state.data.posts[itemLink] = {
                title: item.querySelector('title')?.textContent || 'Нет заголовка',
                description: item.querySelector('description').textContent || 'Нет описания',
                link: itemLink,
            }
            state.ui.postsOrder[rssLink].unshift(itemLink);
        }
    })
    updateUI(state);
}

export const addReadPostInState = (currentPostData) => {
    state.ui.readPosts.push(currentPostData.link);
}