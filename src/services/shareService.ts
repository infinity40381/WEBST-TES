export const sharePost = async (post: any) => {
  try {
    if (navigator.share) {
      // Use native Web Share API if available
      await navigator.share({
        title: `${post.author.displayName} on ssocieyt`,
        text: post.content,
        url: `${window.location.origin}/post/${post.id}`
      });
    } else {
      // Fallback to copying link to clipboard
      const postUrl = `${window.location.origin}/post/${post.id}`;
      await navigator.clipboard.writeText(postUrl);
      
      // Show share options modal
      showShareModal(post);
    }
  } catch (error) {
    console.error('Error sharing post:', error);
    throw error;
  }
};

const showShareModal = (post: any) => {
  const postUrl = encodeURIComponent(`${window.location.origin}/post/${post.id}`);
  const postText = encodeURIComponent(post.content);
  
  const shareOptions = [
    {
      name: 'WhatsApp',
      url: `https://wa.me/?text=${postText}%20${postUrl}`,
      color: '#25D366'
    },
    {
      name: 'Twitter/X',
      url: `https://twitter.com/intent/tweet?text=${postText}&url=${postUrl}`,
      color: '#1DA1F2'
    },
    {
      name: 'Instagram',
      url: `https://www.instagram.com/`,
      color: '#E4405F'
    },
    {
      name: 'Copy Link',
      action: () => {
        navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
      },
      color: '#6B7280'
    }
  ];
  
  // Create and show modal
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50';
  modal.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full">
      <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Share Post</h3>
      <div class="space-y-3">
        ${shareOptions.map(option => `
          <button 
            class="w-full flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            onclick="${option.action ? 'this.onclick()' : `window.open('${option.url}', '_blank')`}"
            ${option.action ? `data-action="true"` : ''}
          >
            <div class="w-8 h-8 rounded-full flex items-center justify-center mr-3" style="background-color: ${option.color}">
              <span class="text-white text-sm font-medium">${option.name.charAt(0)}</span>
            </div>
            <span class="text-gray-900 dark:text-white">${option.name}</span>
          </button>
        `).join('')}
      </div>
      <button 
        class="w-full mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        onclick="this.closest('.fixed').remove()"
      >
        Cancel
      </button>
    </div>
  `;
  
  // Add event listeners for copy action
  modal.querySelectorAll('[data-action="true"]').forEach(button => {
    button.addEventListener('click', () => {
      navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
      modal.remove();
    });
  });
  
  document.body.appendChild(modal);
  
  // Remove modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
};