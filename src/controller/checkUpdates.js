import state from "../state/state";
import fetchRSS from "./fetchRss";
import parseXML from "./parseRSS";
import {addNewPostsInState} from "../state/updateState";
import {globalIgnores} from "eslint/config";

let isUpdating = false;

export const checkUpdates = async () => {
    if (isUpdating) return;
    isUpdating = true;

    try {
        await Promise.all(state.ui.rssLinksOrder.map(async (rssLink) => {
            try {
                const xmlString = await fetchRSS(rssLink);
                const xmlDoc = await parseXML(xmlString);
                const newPostLinksArr = [];
                xmlDoc.querySelectorAll('item').forEach(item => {
                    const postLink = item.querySelector('link')?.textContent;
                    if (!(state.data.posts[postLink]?.link === postLink)) {
                        newPostLinksArr.push(postLink);
                    }
                })

                if (newPostLinksArr.length > 0) {
                    addNewPostsInState(rssLink, newPostLinksArr, xmlDoc);
                }
            } catch (error) {
                console.error(`Ошибка для ${rssLink}:`, error);
            }
        }));
    } finally {
        isUpdating = false;
        setTimeout(checkUpdates, 5000);
    }
};