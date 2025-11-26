import { previewBtnHandler, submitHandler } from '../controller/handlers.js'
import state from '../state/state.js'

const initListeners = () => {
  // Add RSS Button:
  const form = document.getElementById('rss-form')
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const rssInput = document.getElementById('rss-input')
    const rssValue = rssInput.value
    submitHandler(rssValue)
  })

  // Preview post Buttons:
  const postList = document.getElementById('ulPosts')
  postList.addEventListener('click', (event) => {
    const buttonPostPreview = event.target.closest('button')
    if (!buttonPostPreview) return
    const { postLink } = buttonPostPreview.dataset
    const currentPostData = state.data.posts[postLink]
    previewBtnHandler(currentPostData)
  })
}

export default initListeners
