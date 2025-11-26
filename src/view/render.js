import { Modal } from 'bootstrap'
import i18n from '../i18n/init.js'

export const updateUI = (state) => {
  const feeds = document.getElementById('ulFeeds')
  const posts = document.getElementById('ulPosts')
  feeds.innerHTML = ''
  posts.innerHTML = ''

  state.ui.rssLinksOrder.forEach((rssLink) => {
    const feedTitle = document.createElement('h4')
    const feedDescription = document.createElement('p')
    feedTitle.textContent = state.data.feeds[rssLink].title
    feedDescription.textContent = state.data.feeds[rssLink].description
    feeds.appendChild(feedTitle)
    feeds.appendChild(feedDescription)

    state.ui.postsOrder[rssLink].forEach((postItemLink) => {
      const postData = state.data.posts[postItemLink]
      const postItem = document.createElement('li')
      postItem.classList.add('list-group-item', 'd-flex', 'justify-content-between')

      const postLink = document.createElement('a')
      postLink.href = postData.link
      postLink.textContent = postData.title
      postLink.target = '_blank'
      postLink.classList.add('fw-bold')

      const postButton = document.createElement('button')
      postButton.classList.add('btn', 'btn-outline-primary', 'btn-sm')
      postButton.setAttribute('data-post-link', postData.link)
      postButton.textContent = 'Просмотр'

      if (state.ui.readPosts.includes(postData.link)) {
        postLink.classList.add('fw-normal')
        postButton.classList.add('disabled')
      }

      postItem.appendChild(postLink)
      postItem.appendChild(postButton)
      posts.appendChild(postItem)
    })
  })
}

export const updateFeedback = (type, message) => {
  const feedback = document.querySelector('.feedback')
  feedback.textContent = i18n.t(message)
  feedback.classList.remove('text-success', 'text-danger')
  feedback.classList.add(`text-${type}`)
};

export const modalRender = (currentPostData) => {
  const modalElement = document.getElementById('modalPreviewPost')
  if (!modalElement || !currentPostData) return
  const modalTitle = modalElement.querySelector('#modal-title')
  const modalDescription = modalElement.querySelector('#modal-description')
  const readMoreBtn = modalElement.querySelector('#btn-read-more')

  if (modalTitle) modalTitle.textContent = currentPostData.title || ''
  if (modalDescription) modalDescription.textContent = currentPostData.description || ''

  if (readMoreBtn) {
    readMoreBtn.onclick = null
    readMoreBtn.onclick = () => {
      if (currentPostData.link) {
        window.open(currentPostData.link, '_blank') // Открываем в новой вкладке
      }
    }
  }
  const modal = new Modal(modalElement)
  modal.show()
}
