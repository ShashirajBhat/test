/**
 * Website V1 — Desktop Portfolio Interactive Controller
 * Features:
 * 1. Default State: Always opens directly to "The Mind" home screen.
 * 2. Full-Screen Window Tabs: Spans 100% of workspace above the bottom taskbar.
 * 3. Folder Toggle Close: Clicking the open folder again (or clicking "The Mind")
 *    closes the folder tab just like it opened, scaling back down into its folder icon,
 *    and leads back to the home/The Mind screen.
 * 4. Stacking: New section tab scales up and completely covers older tab.
 * 5. Taskbar Search: Writeable search matching section headings, categories & files.
 * 6. Mobile Compatibility: Responsive dock, touch targets, mobile search pill & safe-areas.
 */

document.addEventListener('DOMContentLoaded', () => {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // --- DOM References ---
  const workspaceArea = document.getElementById('workspace-area');
  const wallpaperMind = document.getElementById('section-the-mind');
  const folderButtons = document.querySelectorAll('.folder-item');
  const windowTabs = document.querySelectorAll('.desktop-window-tab');
  const winActionButtons = document.querySelectorAll('.win-btn');

  // Search DOM Elements
  const searchContainer = document.getElementById('search-container');
  const searchInputWrapper = document.getElementById('search-input-wrapper');
  const searchInput = document.getElementById('taskbar-search-input');
  const searchFlyout = document.getElementById('search-results-flyout');
  const searchResultsList = document.getElementById('search-results-list');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const searchResultsCount = document.getElementById('search-results-count');
  const flyoutCloseBtn = document.getElementById('flyout-close-btn');

  // Navigation State
  let currentSectionId = 'the-mind';
  let isNavigating = false;
  let selectedResultIndex = -1;
  let topZIndex = 10;

  // --- 1. Search Engine Dataset ---
  const SEARCH_INDEX = [
    {
      title: 'The Mind',
      subtitle: 'Somewhere between a thought and a finished file',
      category: 'Home / Wallpaper',
      targetSection: 'the-mind',
      targetRowId: null,
      iconType: 'home',
      keywords: ['the mind', 'mind', 'home', 'thought', 'finished', 'file', 'creative', 'welcome', 'wallpaper']
    },
    {
      title: 'The Outputs',
      subtitle: 'Selected visual work, advertising campaigns & motion design',
      category: 'Directory 01',
      targetSection: 'the-outputs',
      targetRowId: null,
      iconType: 'folder',
      keywords: ['the outputs', 'outputs', 'portfolio', 'work', 'projects', 'archive', 'visual']
    },
    {
      title: 'Static Creatives',
      subtitle: 'Campaigns, visuals & brand stories',
      category: 'The Outputs',
      targetSection: 'the-outputs',
      targetRowId: 'card-0',
      iconType: 'file',
      keywords: ['static creatives', 'static', 'social media', 'social', 'campaigns', 'instagram', 'digital', 'brand']
    },
    {
      title: 'Motion Graphics',
      subtitle: 'Kinetic design & animated identities',
      category: 'The Outputs',
      targetSection: 'the-outputs',
      targetRowId: 'card-1',
      iconType: 'file',
      keywords: ['motion graphics', 'motion', 'animation', 'kinetic', 'title design']
    },
    {
      title: 'Reels & Video',
      subtitle: 'Short-form direction & editorial edits',
      category: 'The Outputs',
      targetSection: 'the-outputs',
      targetRowId: 'card-2',
      iconType: 'file',
      keywords: ['reels', 'video', 'editorial', 'films', 'cinematic', 'shorts']
    },
    {
      title: 'Ad Campaigns',
      subtitle: 'Commercial key visuals & art direction',
      category: 'The Outputs',
      targetSection: 'the-outputs',
      targetRowId: 'card-3',
      iconType: 'file',
      keywords: ['ad campaigns', 'advertising', 'commercial', 'print', 'key visuals']
    },
    {
      title: '3D Works',
      subtitle: 'Surreal spatial design & 3D artwork',
      category: 'The Outputs',
      targetSection: 'the-outputs',
      targetRowId: 'card-4',
      iconType: 'file',
      keywords: ['3d works', '3d', 'renders', 'spatial', 'sculptural', 'cgi']
    },
    {
      title: 'The Human',
      subtitle: 'The person, perspective, and creative instincts behind the files',
      category: 'Start Menu // The Human',
      targetSection: 'the-human',
      targetTab: 'overview',
      targetRowId: null,
      iconType: 'folder',
      keywords: ['the human', 'human', 'about', 'bio', 'dossier', 'profile', 'designer', 'background', 'overview', 'start', 'start menu']
    },
    {
      title: 'More About the Human (Details)',
      subtitle: 'Design, art direction, creative production, toolkit & industry experience',
      category: 'The Human',
      targetSection: 'the-human',
      targetTab: 'details',
      targetRowId: null,
      iconType: 'file',
      keywords: ['more about the human', 'details', 'scope', 'practice', 'design', 'art direction', 'creative production', 'branding', 'motion graphics', '3d', 'toolkit', 'photoshop', 'illustrator', 'after effects', 'blender', 'industry experience']
    },
    {
      title: 'The Journey So Far (Experience)',
      subtitle: 'Timeline, career experience & educational milestones',
      category: 'The Human',
      targetSection: 'the-human',
      targetTab: 'experience',
      targetRowId: null,
      iconType: 'file',
      keywords: ['the journey so far', 'journey', 'experience', 'qualification', 'credentials', 'timeline', 'bsc animation', 'graphic designer', 'manipal']
    },
    {
      title: 'Your Move',
      subtitle: 'Inquiries, collaborations, and commercial commissions',
      category: 'Directory 03 // Message',
      targetSection: 'your-move',
      targetRowId: null,
      iconType: 'folder',
      keywords: ['your move', 'move', 'contact', 'inquiries', 'commissions', 'collaborations', 'hire', 'reach out', 'email', 'message', 'form', "let's hear it"]
    },
    {
      title: 'LinkedIn',
      subtitle: 'Professional profile, network & career updates',
      category: 'External Link // Social',
      targetSection: 'linkedin',
      targetRowId: null,
      iconType: 'link',
      keywords: ['linkedin', 'profile', 'connect', 'social', 'network', 'career', 'professional', 'cv', 'resume']
    }
  ];

  // --- 2. Dynamic Transform Origin Calculation ---
  /**
   * Sets transform-origin of window tab directly to the clicked folder icon's coordinates
   */
  function setWindowOriginFromFolder(windowElement, folderButton) {
    if (!windowElement || !folderButton) return;

    const folderRect = folderButton.getBoundingClientRect();
    const workspaceRect = workspaceArea.getBoundingClientRect();

    const folderCenterX = folderRect.left + folderRect.width / 2;
    const folderCenterY = folderRect.top + folderRect.height / 2;

    const relOriginX = folderCenterX - workspaceRect.left;
    const relOriginY = folderCenterY - workspaceRect.top;

    windowElement.style.transformOrigin = `${relOriginX}px ${relOriginY}px`;
  }

  // --- 3. Close Active Folder and Return to The Mind (Home) ---
  /**
   * Closes any currently open window tab by scaling down smoothly into its folder icon,
   * leading directly back to "The Mind" home page.
   */
  function closeToHome() {
    if (typeof isYourMoveOpen !== 'undefined' && isYourMoveOpen) {
      closeYourMoveWindow();
    }
    if (typeof isStartMenuOpen !== 'undefined' && isStartMenuOpen) {
      closeStartMenu();
    }
    if (currentSectionId === 'the-mind' || isNavigating) return;

    isNavigating = true;
    const activeWindow = document.getElementById(`section-${currentSectionId}`);
    const activeFolderBtn = document.getElementById(`folder-${currentSectionId}`);

    // Update taskbar folder active states immediately to The Mind
    folderButtons.forEach((btn) => {
      const isMind = btn.getAttribute('data-target') === 'the-mind';
      btn.classList.toggle('is-active', isMind);
      btn.setAttribute('aria-selected', isMind ? 'true' : 'false');
    });

    if (activeWindow && activeFolderBtn) {
      // Align scaling origin with the folder icon being closed
      setWindowOriginFromFolder(activeWindow, activeFolderBtn);

      // Trigger scale-down animation into the folder icon
      activeWindow.classList.remove('window-opened');
      activeWindow.classList.add('window-scaling-out');

      setTimeout(() => {
        // Reset outputs app state while tab is still accessible in DOM tree before hiding
        resetOutputsState();

        // Guarantee all window tabs are completely hidden
        windowTabs.forEach((tab) => {
          tab.hidden = true;
          tab.classList.remove('window-opened', 'window-scaling-in', 'window-scaling-out');
        });

        // Ensure home wallpaper is visible and active
        wallpaperMind.hidden = false;
        wallpaperMind.classList.add('is-active');

        currentSectionId = 'the-mind';
        topZIndex = 10;
        isNavigating = false;

        // Clean URL hash
        history.replaceState(null, '', window.location.pathname);
      }, 280);
    } else {
      resetOutputsState();
      windowTabs.forEach((tab) => {
        tab.hidden = true;
        tab.classList.remove('window-opened', 'window-scaling-in', 'window-scaling-out');
      });
      wallpaperMind.hidden = false;
      wallpaperMind.classList.add('is-active');
      currentSectionId = 'the-mind';
      topZIndex = 10;
      isNavigating = false;
      history.replaceState(null, '', window.location.pathname);
    }
  }

  // --- 4. Open New Section Tab (Covering older tab) ---
  /**
   * Opens the destination window tab, scaling up from its folder icon to completely cover the screen.
   */
  function openSection(targetId, highlightRowId = null, targetTab = null) {
    if (targetId === 'the-human') {
      if (typeof openStartMenu === 'function') {
        openStartMenu(targetTab || 'overview');
      }
      return;
    }

    if (targetId === 'your-move') {
      if (typeof openYourMoveWindow === 'function') {
        openYourMoveWindow();
      }
      return;
    }

    if (isNavigating || targetId === currentSectionId) return;

    const nextWindow = document.getElementById(`section-${targetId}`);
    const nextFolderBtn = document.getElementById(`folder-${targetId}`);
    const previousWindow = currentSectionId !== 'the-mind' 
      ? document.getElementById(`section-${currentSectionId}`) 
      : null;

    if (!nextWindow || !nextFolderBtn) return;

    isNavigating = true;

    // Update active folder state on taskbar
    folderButtons.forEach((btn) => {
      const isTarget = btn.getAttribute('data-target') === targetId;
      btn.classList.toggle('is-active', isTarget);
      btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    // Assign higher z-index so new section tab completely covers older tab
    topZIndex += 2;
    nextWindow.style.zIndex = topZIndex;

    // Position origin at clicked folder icon
    setWindowOriginFromFolder(nextWindow, nextFolderBtn);

    // If opening The Outputs: immediately reset viewport to scrollTop = 0 and update card transforms to initial hero state
    // so no stale scroll offset is visible while the window scales in
    if (targetId === 'the-outputs' && sessionStorage.getItem('outputs_restore_active') !== 'true') {
      if (outputsViewport) {
        outputsViewport.scrollTop = 0;
        if (typeof outputsViewport.scrollTo === 'function') {
          outputsViewport.scrollTo({ top: 0, behavior: 'instant' });
        }
      }
      currentOutputsIndex = -1;
      sessionStorage.setItem('outputs_scroll_pos', '0');
      sessionStorage.setItem('outputs_active_index', '0');
      sessionStorage.setItem('outputs_active_category', 'static-creatives');
      setOutputsActiveCategory(0, true);
      updateOutputsScroll();
    }

    // Initial scale-in state
    nextWindow.hidden = false;
    nextWindow.classList.remove('window-opened', 'window-scaling-out');
    nextWindow.classList.add('window-scaling-in');

    // Confirm instant reset right after unhiding
    if (targetId === 'the-outputs' && sessionStorage.getItem('outputs_restore_active') !== 'true') {
      if (outputsViewport) {
        outputsViewport.scrollTop = 0;
        if (typeof outputsViewport.scrollTo === 'function') {
          outputsViewport.scrollTo({ top: 0, behavior: 'instant' });
        }
      }
      updateOutputsScroll();
    }

    requestAnimationFrame(() => {
      setWindowOriginFromFolder(nextWindow, nextFolderBtn);

      if (targetId === 'the-outputs' && sessionStorage.getItem('outputs_restore_active') !== 'true') {
        if (outputsViewport && outputsViewport.scrollTop !== 0) {
          outputsViewport.scrollTop = 0;
          if (typeof outputsViewport.scrollTo === 'function') {
            outputsViewport.scrollTo({ top: 0, behavior: 'instant' });
          }
          updateOutputsScroll();
        }
      }

      requestAnimationFrame(() => {
        nextWindow.classList.remove('window-scaling-in');
        nextWindow.classList.add('window-opened');

        if (targetId === 'the-outputs' && sessionStorage.getItem('outputs_restore_active') !== 'true') {
          if (outputsViewport && outputsViewport.scrollTop !== 0) {
            outputsViewport.scrollTop = 0;
            updateOutputsScroll();
          }
        }

        // Once new tab has fully expanded and covered the screen (~330ms):
        setTimeout(() => {
          // Hide previous tab completely so it never lingers beneath
          if (previousWindow && previousWindow !== nextWindow) {
            previousWindow.hidden = true;
            previousWindow.classList.remove('window-opened', 'window-scaling-in', 'window-scaling-out');
          }

          currentSectionId = targetId;
          isNavigating = false;

          // If opening The Outputs: launch cards cascade entrance directly
          if (targetId === 'the-outputs') {
            wallpaperMind.hidden = true;
            wallpaperMind.classList.remove('is-active');
            launchOutputsApp();
          }

          // If opening The Human: ensure background wallpaper hidden & switch to tab if specified
          if (targetId === 'the-human') {
            wallpaperMind.hidden = true;
            wallpaperMind.classList.remove('is-active');
            if (targetTab && typeof switchHumanTab === 'function') {
              switchHumanTab(targetTab);
            }
          }

          // Pulse row if navigated from search
          if (highlightRowId) {
            const rowEl = document.getElementById(highlightRowId);
            if (rowEl) {
              rowEl.classList.add('is-highlighted');
              setTimeout(() => rowEl.classList.remove('is-highlighted'), 2400);
            }
          }
        }, 330);
      });
    });

    history.replaceState(null, '', `#${targetId}`);
  }

  // --- 5. Folder Navigation Click Handler ---
  folderButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeSearchFlyout();
      const target = btn.getAttribute('data-target');
      if (!target) return;

      // Clicked "Your Move" -> Toggle floating contact window over underlying page
      if (target === 'your-move') {
        if (typeof toggleYourMoveWindow === 'function') {
          toggleYourMoveWindow();
        }
        return;
      }

      // Clicked "LinkedIn" -> Open external profile in new tab
      if (target === 'linkedin') {
        const url = btn.getAttribute('data-url') || btn.getAttribute('href') || 'https://www.linkedin.com/';
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }

      // If Your Move was open as floating window, close it when switching folders
      if (typeof isYourMoveOpen !== 'undefined' && isYourMoveOpen) {
        closeYourMoveWindow();
      }

      // Clicked "The Mind" while in another section -> Close window and return home
      if (target === 'the-mind') {
        closeToHome();
        return;
      }

      // Clicked the currently open folder again -> Close window and return to home / The Mind!
      if (target === currentSectionId) {
        closeToHome();
        return;
      }

      // Clicked a different folder -> Open that section tab (covering older tab)
      openSection(target);
    });

    // Arrow keys between folders
    btn.addEventListener('keydown', (e) => {
      const buttonsArr = Array.from(folderButtons);
      const currentIndex = buttonsArr.indexOf(btn);

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        buttonsArr[(currentIndex + 1) % buttonsArr.length].focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        buttonsArr[(currentIndex - 1 + buttonsArr.length) % buttonsArr.length].focus();
      }
    });
  });

  // --- 6. Window Titlebar Minimize / Close Buttons (For full-page window tabs like The Outputs) ---
  winActionButtons.forEach((btn) => {
    // Exclude floating modals like Your Move or Start Menu
    if (btn.closest('#window-your-move') || btn.closest('#start-menu-human')) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeToHome();
    });
  });

  // --- 7. Taskbar Search Engine ---
  function openSearchFlyout() {
    searchFlyout.hidden = false;
    searchInput.setAttribute('aria-expanded', 'true');
    if (searchContainer) searchContainer.classList.add('is-mobile-open');
    renderSearchResults(searchInput.value.trim());
  }

  function closeSearchFlyout() {
    searchFlyout.hidden = true;
    searchInput.setAttribute('aria-expanded', 'false');
    if (searchContainer) searchContainer.classList.remove('is-mobile-open');
    selectedResultIndex = -1;
  }

  function highlightMatches(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  function renderSearchResults(query = '') {
    const cleanQuery = query.toLowerCase();
    searchResultsList.innerHTML = '';

    let matchedItems = [];

    if (!cleanQuery) {
      matchedItems = SEARCH_INDEX.slice(0, 5);
    } else {
      matchedItems = SEARCH_INDEX.filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(cleanQuery);
        const subMatch = item.subtitle.toLowerCase().includes(cleanQuery);
        const catMatch = item.category.toLowerCase().includes(cleanQuery);
        const keywordMatch = item.keywords.some((kw) => kw.includes(cleanQuery));
        return titleMatch || subMatch || catMatch || keywordMatch;
      });
    }

    searchResultsCount.textContent = `${matchedItems.length} item${matchedItems.length === 1 ? '' : 's'}`;

    if (matchedItems.length === 0) {
      searchResultsList.innerHTML = `
        <div class="search-empty-state">
          No matching files or sections found for "${query}"
        </div>
      `;
      return;
    }

    matchedItems.forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'search-result-item';
      btn.setAttribute('role', 'option');
      btn.setAttribute('data-target-section', item.targetSection);
      if (item.targetRowId) {
        btn.setAttribute('data-target-row', item.targetRowId);
      }
      if (item.targetTab) {
        btn.setAttribute('data-target-tab', item.targetTab);
      }

      const iconSvg = item.iconType === 'folder' 
        ? `<svg viewBox="0 0 20 16" fill="none"><path d="M2 3C2 2.45 2.45 2 3 2H7.2C7.6 2 7.9 2.2 8.1 2.5L8.9 3.5C9.1 3.8 9.4 4 9.8 4H17C17.55 4 18 4.45 18 5V13C18 13.55 17.55 14 17 14H3C2.45 14 2 13.55 2 13V3Z" fill="#26292d" stroke="#24a3de" stroke-width="1.2"/></svg>`
        : `<svg viewBox="0 0 20 16" fill="none"><path d="M4 2H12L16 6V14H4V2Z" fill="#222527" stroke="#94a3b8" stroke-width="1.2"/><line x1="7" y1="7" x2="11" y2="7" stroke="#94a3b8"/><line x1="7" y1="10" x2="13" y2="10" stroke="#94a3b8"/></svg>`;

      btn.innerHTML = `
        <div class="result-icon">${iconSvg}</div>
        <div class="result-text-group">
          <span class="result-title">${highlightMatches(item.title, query)}</span>
          <span class="result-category">${item.category} • ${item.subtitle}</span>
        </div>
      `;

      btn.addEventListener('click', () => {
        const sec = btn.getAttribute('data-target-section');
        const row = btn.getAttribute('data-target-row');
        const tab = btn.getAttribute('data-target-tab');
        closeSearchFlyout();
        if (sec === 'the-mind') {
          closeToHome();
        } else if (sec === 'the-human') {
          openStartMenu(tab || 'overview');
        } else if (sec === 'your-move') {
          openYourMoveWindow();
        } else if (sec === 'linkedin') {
          const lkBtn = document.getElementById('folder-linkedin');
          const url = (lkBtn && (lkBtn.getAttribute('data-url') || lkBtn.getAttribute('href'))) || 'https://www.linkedin.com/';
          window.open(url, '_blank', 'noopener,noreferrer');
        } else {
          openSection(sec, row, tab);
        }
      });

      searchResultsList.appendChild(btn);
    });

    selectedResultIndex = -1;
  }

  // Tapping search wrapper opens and focuses search
  if (searchInputWrapper) {
    searchInputWrapper.addEventListener('click', (e) => {
      if (e.target.closest('#search-clear-btn')) return;
      openSearchFlyout();
      searchInput.focus();
    });
  }

  // Search input events
  searchInput.addEventListener('focus', () => {
    openSearchFlyout();
  });

  searchInput.addEventListener('input', () => {
    const val = searchInput.value;
    searchClearBtn.hidden = val.length === 0;
    openSearchFlyout();
  });

  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchClearBtn.hidden = true;
    searchInput.focus();
    renderSearchResults('');
  });

  if (flyoutCloseBtn) {
    flyoutCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeSearchFlyout();
    });
  }

  // Search keyboard navigation
  searchInput.addEventListener('keydown', (e) => {
    const items = searchResultsList.querySelectorAll('.search-result-item');
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedResultIndex = (selectedResultIndex + 1) % items.length;
      updateSelectedSearchItem(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedResultIndex = (selectedResultIndex - 1 + items.length) % items.length;
      updateSelectedSearchItem(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedResultIndex >= 0 && items[selectedResultIndex]) {
        items[selectedResultIndex].click();
      } else if (items.length > 0) {
        items[0].click();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeSearchFlyout();
      searchInput.blur();
    }
  });

  function updateSelectedSearchItem(items) {
    items.forEach((item, idx) => {
      const isSelected = idx === selectedResultIndex;
      item.classList.toggle('is-selected', isSelected);
      if (isSelected) {
        item.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  // Global click outside to close search flyout
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#search-container')) {
      closeSearchFlyout();
    }
  });

  // Global Keyboard Shortcuts (Ctrl+K or /)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      searchInput.focus();
      openSearchFlyout();
    } else if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
      openSearchFlyout();
    } else if (e.key === 'Escape' && !searchFlyout.hidden) {
      closeSearchFlyout();
    }
  });

  // Handle window resizing and mobile orientation changes
  window.addEventListener('resize', () => {
    if (currentSectionId !== 'the-mind') {
      const activeWindow = document.getElementById(`section-${currentSectionId}`);
      const activeFolder = document.getElementById(`folder-${currentSectionId}`);
      if (activeWindow && activeFolder) {
        setWindowOriginFromFolder(activeWindow, activeFolder);
      }
    }
  });

  // ========================================================================
  // 7.5. THE HUMAN: Windows 11-Style Start Menu Controller
  // ========================================================================
  const taskbarStartBtn = document.getElementById('taskbar-start-btn');
  const startMenuHuman = document.getElementById('start-menu-human');
  const startMenuBackdrop = document.getElementById('start-menu-backdrop');
  const startCloseBtn = document.getElementById('start-close-btn');
  const startScrollable = document.getElementById('start-menu-scrollable');
  const startNavPills = document.querySelectorAll('.start-nav-pill');
  const btnStartViewDetails = document.getElementById('btn-start-view-details');
  const btnStartOpenMove = document.getElementById('btn-start-open-move');

  let isStartMenuOpen = false;

  function resetStartMenuScrollInstant() {
    if (!startScrollable) return;
    startScrollable.scrollTop = 0;
    if (typeof startScrollable.scrollTo === 'function') {
      startScrollable.scrollTo({ top: 0, behavior: 'instant' });
    }
    startNavPills.forEach((pill) => {
      pill.classList.toggle('is-active', pill.getAttribute('data-jump') === 'overview');
    });
  }

  let isNavJumping = false;
  let navJumpTimer = null;

  function updateStartMenuScrollspy() {
    if (!startScrollable || isNavJumping) return;

    // Detect if user has reached or is near the bottom of the scrollable container
    const scrollRemaining = startScrollable.scrollHeight - startScrollable.scrollTop - startScrollable.clientHeight;
    const isNearBottom = scrollRemaining <= 120;

    const containerRect = startScrollable.getBoundingClientRect();
    const activationThreshold = containerRect.top + Math.min(220, containerRect.height * 0.45);

    const expEl = document.getElementById('start-section-experience');
    const detailsEl = document.getElementById('start-section-details');

    let currentActive = 'overview';
    if (startScrollable.scrollTop <= 25) {
      currentActive = 'overview';
    } else if (isNearBottom) {
      currentActive = 'experience';
    } else if (expEl && expEl.getBoundingClientRect().top <= activationThreshold) {
      currentActive = 'experience';
    } else if (detailsEl && detailsEl.getBoundingClientRect().top <= activationThreshold) {
      currentActive = 'details';
    } else {
      currentActive = 'overview';
    }

    startNavPills.forEach((pill) => {
      pill.classList.toggle('is-active', pill.getAttribute('data-jump') === currentActive);
    });
  }

  function scrollToStartSection(sectionKey) {
    if (!startScrollable) return;
    const targetEl = document.getElementById(`start-section-${sectionKey}`);
    if (targetEl) {
      isNavJumping = true;
      clearTimeout(navJumpTimer);
      navJumpTimer = setTimeout(() => {
        isNavJumping = false;
        updateStartMenuScrollspy();
      }, 700);

      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Update active jump pill
    startNavPills.forEach((pill) => {
      const isTarget = pill.getAttribute('data-jump') === sectionKey;
      pill.classList.toggle('is-active', isTarget);
    });
  }

  function openStartMenu(targetSubSection = 'overview') {
    if (!startMenuHuman) return;

    // Instantly reset scroll to top before unhiding so it never animates or shows previous scroll pos
    if (!targetSubSection || targetSubSection === 'overview') {
      resetStartMenuScrollInstant();
    }

    isStartMenuOpen = true;
    startMenuHuman.hidden = false;
    if (startMenuBackdrop) startMenuBackdrop.hidden = false;

    // Trigger reflow for smooth animation
    requestAnimationFrame(() => {
      startMenuHuman.classList.add('is-open');
      if (startMenuBackdrop) startMenuBackdrop.classList.add('is-active');
      if (taskbarStartBtn) {
        taskbarStartBtn.classList.add('is-active');
        taskbarStartBtn.setAttribute('aria-expanded', 'true');
      }

      if (targetSubSection && targetSubSection !== 'overview') {
        setTimeout(() => {
          scrollToStartSection(targetSubSection);
        }, 120);
      } else {
        resetStartMenuScrollInstant();
      }
    });
  }

  function closeStartMenu() {
    if (!startMenuHuman || !isStartMenuOpen) return;

    isStartMenuOpen = false;
    startMenuHuman.classList.remove('is-open');
    if (startMenuBackdrop) startMenuBackdrop.classList.remove('is-active');
    if (taskbarStartBtn) {
      taskbarStartBtn.classList.remove('is-active');
      taskbarStartBtn.setAttribute('aria-expanded', 'false');
    }

    // Do NOT reset scroll here while the popup is still fading out, to prevent screen jump.
    // Scroll will be cleanly reset once the popup is completely hidden.

    setTimeout(() => {
      if (!isStartMenuOpen) {
        startMenuHuman.hidden = true;
        if (startMenuBackdrop) startMenuBackdrop.hidden = true;
        // Guarantee scroll is 0 while hidden
        resetStartMenuScrollInstant();
      }
    }, 240);
  }

  function toggleStartMenu() {
    if (isStartMenuOpen) {
      closeStartMenu();
    } else {
      openStartMenu('overview');
    }
  }

  if (taskbarStartBtn) {
    taskbarStartBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeSearchFlyout();
      toggleStartMenu();
    });
  }

  if (startMenuBackdrop) {
    startMenuBackdrop.addEventListener('click', (e) => {
      e.stopPropagation();
      closeStartMenu();
    });
  }

  if (startCloseBtn) {
    startCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeStartMenu();
    });
  }

  // Segmented Section Jump Pills inside Start Menu Header
  startNavPills.forEach((pill) => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      const jumpTarget = pill.getAttribute('data-jump');
      if (jumpTarget) {
        scrollToStartSection(jumpTarget);
      }
    });
  });

  // Action buttons inside Overview hero
  if (btnStartViewDetails) {
    btnStartViewDetails.addEventListener('click', () => {
      scrollToStartSection('details');
    });
  }

  if (btnStartOpenMove) {
    btnStartOpenMove.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeStartMenu();
      openYourMoveWindow();
    });
  }

  // Scroll spy to update jump pills as user scrolls through Start Menu
  if (startScrollable) {
    let scrollTicking = false;
    startScrollable.addEventListener('scroll', () => {
      if (!scrollTicking) {
        requestAnimationFrame(() => {
          updateStartMenuScrollspy();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }, { passive: true });
  }

  // Scroll isolation for The Human Start Menu:
  // When cursor is over the Start Menu, ONLY The Human popup should scroll, never the background tab!
  if (startMenuHuman) {
    startMenuHuman.addEventListener('wheel', (e) => {
      // Isolate scroll so background never receives this event
      e.stopPropagation();

      if (!startScrollable) return;

      // If scrolling over the header, footer, or card borders (outside the scrollable container),
      // forward the scroll delta directly to startScrollable so the user can scroll from anywhere on the popup
      if (!startScrollable.contains(e.target)) {
        startScrollable.scrollTop += e.deltaY;
        e.preventDefault();
        return;
      }

      // If scrolling inside startScrollable, prevent chaining past top/bottom bounds to background
      const atTop = startScrollable.scrollTop <= 0 && e.deltaY < 0;
      const atBottom = (startScrollable.scrollTop + startScrollable.clientHeight >= startScrollable.scrollHeight - 1) && e.deltaY > 0;
      if (atTop || atBottom) {
        e.preventDefault();
      }
    }, { passive: false });

    // Isolate touch scrolling on mobile
    startMenuHuman.addEventListener('touchmove', (e) => {
      e.stopPropagation();
    }, { passive: true });
  }

  // Also prevent wheel events on the backdrop from scrolling background tab
  if (startMenuBackdrop) {
    startMenuBackdrop.addEventListener('wheel', (e) => {
      e.stopPropagation();
      e.preventDefault();
    }, { passive: false });
  }

  // Close Start Menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isStartMenuOpen) {
      closeStartMenu();
    }
  });

  // Close Start Menu when clicking outside of it
  document.addEventListener('click', (e) => {
    if (isStartMenuOpen && 
        startMenuHuman && 
        !startMenuHuman.contains(e.target) && 
        taskbarStartBtn && 
        !taskbarStartBtn.contains(e.target)) {
      closeStartMenu();
    }
  });

  // Interactive Dot & Year Click / Tap Support for The Journey So Far
  const journeyItems = document.querySelectorAll('.journey-item');
  journeyItems.forEach((item) => {
    const dot = item.querySelector('.journey-dot');
    const year = item.querySelector('.journey-year');
    const toggleItem = (e) => {
      const isAlreadyFocused = item.classList.contains('is-focused');
      journeyItems.forEach((other) => other.classList.remove('is-focused'));
      if (!isAlreadyFocused) {
        item.classList.add('is-focused');
      }
    };

    if (dot) dot.addEventListener('click', toggleItem);
    if (year) year.addEventListener('click', toggleItem);
  });

  // ========================================================================
  // 7.6. YOUR MOVE: Floating Contact Window Controller (inspired by UI.png)
  // ========================================================================
  const windowYourMove = document.getElementById('window-your-move');
  const yourMoveBackdrop = document.getElementById('your-move-backdrop');
  const folderYourMove = document.getElementById('folder-your-move');
  const yourMoveCloseBtn = document.getElementById('your-move-close-btn');
  const yourMoveForm = document.getElementById('your-move-form');
  const yourMoveSendBtn = document.getElementById('your-move-send-btn');
  const yourMoveStatusBanner = document.getElementById('your-move-status-banner');

  let isYourMoveOpen = false;
  let sectionBeforeYourMove = 'the-mind';
  let yourMoveCloseTimer = null;

  function openYourMoveWindow() {
    if (!windowYourMove) return;

    // Clear any pending close animation timer
    if (yourMoveCloseTimer) {
      clearTimeout(yourMoveCloseTimer);
      yourMoveCloseTimer = null;
    }

    // Track the active section before opening Your Move
    if (currentSectionId && currentSectionId !== 'your-move') {
      sectionBeforeYourMove = currentSectionId;
    }

    // Close Start Menu if open, and instantly hide its backdrop to avoid double-blur GPU flicker
    if (typeof closeStartMenu === 'function' && isStartMenuOpen) {
      closeStartMenu();
    }
    if (startMenuBackdrop) {
      startMenuBackdrop.classList.remove('is-active');
      startMenuBackdrop.hidden = true;
    }
    if (taskbarStartBtn) {
      taskbarStartBtn.classList.remove('is-active');
      taskbarStartBtn.setAttribute('aria-expanded', 'false');
    }

    isYourMoveOpen = true;
    windowYourMove.hidden = false;
    if (yourMoveBackdrop) yourMoveBackdrop.hidden = false;

    requestAnimationFrame(() => {
      windowYourMove.classList.add('is-open');
      if (yourMoveBackdrop) yourMoveBackdrop.classList.add('is-active');
      if (folderYourMove) {
        folderYourMove.classList.add('is-active');
        folderYourMove.setAttribute('aria-selected', 'true');
        folderYourMove.setAttribute('aria-expanded', 'true');
      }

      // Focus first input field safely without triggering a viewport scroll jump
      const firstInput = document.getElementById('your-move-input-message');
      if (firstInput) {
        setTimeout(() => {
          if (isYourMoveOpen) {
            firstInput.focus({ preventScroll: true });
          }
        }, 150);
      }
    });

    history.replaceState(null, '', '#your-move');
  }

  function closeYourMoveWindow() {
    if (!windowYourMove || !isYourMoveOpen) return;

    if (yourMoveCloseTimer) {
      clearTimeout(yourMoveCloseTimer);
      yourMoveCloseTimer = null;
    }

    isYourMoveOpen = false;
    windowYourMove.classList.remove('is-open');
    if (yourMoveBackdrop) yourMoveBackdrop.classList.remove('is-active');

    // Restore the underlying folder's active state
    const restoreTarget = (currentSectionId && currentSectionId !== 'your-move') 
      ? currentSectionId 
      : sectionBeforeYourMove;

    folderButtons.forEach((btn) => {
      const isTarget = btn.getAttribute('data-target') === restoreTarget;
      btn.classList.toggle('is-active', isTarget);
      btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
      btn.setAttribute('aria-expanded', 'false');
    });

    yourMoveCloseTimer = setTimeout(() => {
      if (!isYourMoveOpen) {
        windowYourMove.hidden = true;
        if (yourMoveBackdrop) yourMoveBackdrop.hidden = true;
      }
      yourMoveCloseTimer = null;
    }, 240);

    // Restore URL hash to the section that was open before Your Move
    if (restoreTarget === 'the-mind') {
      history.replaceState(null, '', window.location.pathname);
    } else {
      history.replaceState(null, '', `#${restoreTarget}`);
    }
  }

  function toggleYourMoveWindow() {
    if (isYourMoveOpen) {
      closeYourMoveWindow();
    } else {
      openYourMoveWindow();
    }
  }

  // Window titlebar close button (Windows-style 'x' on right)
  if (yourMoveCloseBtn) {
    yourMoveCloseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeYourMoveWindow();
    });
  }

  // Click backdrop to dismiss
  if (yourMoveBackdrop) {
    yourMoveBackdrop.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeYourMoveWindow();
    });
  }

  // Click outside to close
  document.addEventListener('click', (e) => {
    if (isYourMoveOpen && 
        windowYourMove && 
        !windowYourMove.contains(e.target) && 
        folderYourMove && 
        !folderYourMove.contains(e.target) &&
        (!btnStartOpenMove || !btnStartOpenMove.contains(e.target))) {
      closeYourMoveWindow();
    }
  });

  // Escape key closes whichever floating window is open
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (isYourMoveOpen) {
        closeYourMoveWindow();
      } else if (isStartMenuOpen) {
        closeStartMenu();
      }
    }
  });

  // Scroll isolation for Your Move floating window
  if (windowYourMove) {
    windowYourMove.addEventListener('wheel', (e) => {
      e.stopPropagation();
      const yourMoveBody = document.getElementById('your-move-body');
      if (yourMoveBody && !yourMoveBody.contains(e.target)) {
        yourMoveBody.scrollTop += e.deltaY;
        e.preventDefault();
        return;
      }
      if (yourMoveBody) {
        const atTop = yourMoveBody.scrollTop <= 0 && e.deltaY < 0;
        const atBottom = (yourMoveBody.scrollTop + yourMoveBody.clientHeight >= yourMoveBody.scrollHeight - 1) && e.deltaY > 0;
        if (atTop || atBottom) {
          e.preventDefault();
        }
      }
    }, { passive: false });

    windowYourMove.addEventListener('touchmove', (e) => {
      e.stopPropagation();
    }, { passive: true });
  }

  if (yourMoveBackdrop) {
    yourMoveBackdrop.addEventListener('wheel', (e) => {
      e.stopPropagation();
      e.preventDefault();
    }, { passive: false });
  }

  // Contact Form Submission & Validation Handler
  if (yourMoveForm) {
    yourMoveForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const messageInput = document.getElementById('your-move-input-message');
      const nameInput = document.getElementById('your-move-input-name');
      const emailInput = document.getElementById('your-move-input-email');

      const messageVal = messageInput ? messageInput.value.trim() : '';
      const nameVal = nameInput ? nameInput.value.trim() : '';
      const emailVal = emailInput ? emailInput.value.trim() : '';

      // Reset field errors
      document.querySelectorAll('.form-group-block').forEach((b) => b.classList.remove('has-error'));
      if (yourMoveStatusBanner) yourMoveStatusBanner.hidden = true;

      if (!messageVal) {
        document.querySelector('[data-field="message"]')?.classList.add('has-error');
        messageInput?.focus();
        showYourMoveBanner("Please tell us what's on your mind.", 'error');
        return;
      }

      if (!nameVal) {
        document.querySelector('[data-field="name"]')?.classList.add('has-error');
        nameInput?.focus();
        showYourMoveBanner('Please enter your name.', 'error');
        return;
      }

      if (!emailVal || !emailVal.includes('@')) {
        document.querySelector('[data-field="email"]')?.classList.add('has-error');
        emailInput?.focus();
        showYourMoveBanner('Please enter a valid reply email address.', 'error');
        return;
      }

      // Valid: show sending state
      if (yourMoveSendBtn) {
        yourMoveSendBtn.disabled = true;
        const spanText = yourMoveSendBtn.querySelector('span');
        if (spanText) spanText.textContent = 'Sending...';
      }

      // Simulated smooth submission
      setTimeout(() => {
        showYourMoveBanner(`Message received! Thank you ${nameVal}, I'll be in touch soon.`, 'success');
        if (yourMoveSendBtn) {
          yourMoveSendBtn.disabled = false;
          const spanText = yourMoveSendBtn.querySelector('span');
          if (spanText) spanText.textContent = 'Sent!';
        }

        yourMoveForm.reset();

        setTimeout(() => {
          if (yourMoveSendBtn) {
            const spanText = yourMoveSendBtn.querySelector('span');
            if (spanText) spanText.textContent = 'Send it';
          }
          closeYourMoveWindow();
        }, 2200);
      }, 650);
    });
  }

  function showYourMoveBanner(msg, type = 'success') {
    if (!yourMoveStatusBanner) return;
    yourMoveStatusBanner.textContent = msg;
    yourMoveStatusBanner.className = `your-move-status-banner is-${type}`;
    yourMoveStatusBanner.hidden = false;
  }

  // ========================================================================
  // 8. THE OUTPUTS: Interactive App Controller & Per Appelgren Scroll Engine
  // ========================================================================

  const CATEGORIES = [
    { name: 'Static Creatives', slug: 'static-creatives' },
    { name: 'Motion Graphics', slug: 'motion-graphics' },
    { name: 'Reels & Video', slug: 'reels-video' },
    { name: 'Ad Campaigns', slug: 'ad-campaigns' },
    { name: '3D Works', slug: '3d-works' }
  ];

  const STACK_CONFIG = [
    { rotate: 0, translateY: 0, translateZ: 0, zIndex: 10 },
    { rotate: 1.5, translateY: 4, translateZ: -20, zIndex: 9 },
    { rotate: -2, translateY: 8, translateZ: -40, zIndex: 8 },
    { rotate: 2.5, translateY: 12, translateZ: -60, zIndex: 7 },
    { rotate: -3.5, translateY: 16, translateZ: -80, zIndex: 6 }
  ];

  // 3D Perspective Exit Trajectories with Enhanced Spatial Distortion & Depth
  const EXIT_CONFIG = [
    { x: -135, y: -22, z: 240, rotX: 10,  rotY: 34,  rotZ: -11.0, skewY: -4, scale: 1.40 }, // Card 0 (Static Creatives): Peels Top-Left in 3D
    { x:  135, y:  20, z: 230, rotX: -10, rotY: -32, rotZ: 12.0,  skewY:  4, scale: 1.38 }, // Card 1 (Motion Graphics): Peels Bottom-Right in 3D
    { x: -132, y:  18, z: 230, rotX: -10, rotY: 32,  rotZ: -14.0, skewY: -4, scale: 1.38 }, // Card 2 (Reels & Video): Peels Bottom-Left in 3D
    { x:  136, y: -24, z: 240, rotX: 11,  rotY: -34, rotZ: 11.0,  skewY:  4, scale: 1.40 }  // Card 3 (Ad Campaigns): Peels Top-Right in 3D
  ];

  const outputsLoader = document.getElementById('outputs-app-loader');
  const outputsViewport = document.getElementById('outputs-viewport');
  const outputsHero = document.getElementById('outputs-hero');
  const outputsTrack = document.getElementById('outputs-gallery-track');
  const outputsCards = Array.from(document.querySelectorAll('.outputs-card'));
  const outputsBgTitles = Array.from(document.querySelectorAll('.bg-title-word'));
  const outputsBgTitlesContainer = document.querySelector('.outputs-bg-titles');
  const outputsBgElements = document.querySelector('.outputs-bg-elements');
  const outputsDots = Array.from(document.querySelectorAll('.progress-dot'));
  const outputsBgCounter = document.getElementById('outputs-bg-counter');

  let outputsLoaderTimer = null;
  let currentOutputsIndex = -1;

  // Slow, subtle mouse parallax state (perappelgren.de style)
  let targetMouseX = 0;
  let targetMouseY = 0;
  let currentMouseX = 0;
  let currentMouseY = 0;
  let isParallaxRunning = false;
  let scrollNeedsRender = false;

  function onOutputsMouseMove(e) {
    if (!outputsViewport) return;
    const rect = outputsViewport.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    // Normalized offset from center: -0.5 to +0.5
    const nx = ((e.clientX - rect.left) / rect.width) - 0.5;
    const ny = ((e.clientY - rect.top) / rect.height) - 0.5;
    targetMouseX = Math.max(-0.5, Math.min(0.5, nx));
    targetMouseY = Math.max(-0.5, Math.min(0.5, ny));
    startOutputsMotionEngine();
  }

  function onOutputsMouseLeave() {
    targetMouseX = 0;
    targetMouseY = 0;
    startOutputsMotionEngine();
  }

  function startOutputsMotionEngine() {
    if (!isParallaxRunning) {
      isParallaxRunning = true;
      requestAnimationFrame(tickOutputsMotionEngine);
    }
  }

  function tickOutputsMotionEngine() {
    const dx = targetMouseX - currentMouseX;
    const dy = targetMouseY - currentMouseY;

    // Luxurious, slow inertia damping (0.055)
    currentMouseX += dx * 0.055;
    currentMouseY += dy * 0.055;

    updateOutputsScroll();

    // Continue running while mouse is catching up or if a scroll tick occurred
    if (Math.abs(dx) > 0.0002 || Math.abs(dy) > 0.0002 || scrollNeedsRender) {
      scrollNeedsRender = false;
      requestAnimationFrame(tickOutputsMotionEngine);
    } else {
      isParallaxRunning = false;
    }
  }

  function launchOutputsApp() {
    clearTimeout(outputsLoaderTimer);

    if (outputsLoader) {
      outputsLoader.classList.add('loader-hidden');
    }

    // If restore is active from category.html back navigation, let restoreOutputsView handle state
    if (sessionStorage.getItem('outputs_restore_active') === 'true') {
      restoreOutputsView();
      return;
    }

    if (outputsViewport) {
      outputsViewport.scrollTop = 0;
      if (typeof outputsViewport.scrollTo === 'function') {
        outputsViewport.scrollTo({ top: 0, behavior: 'instant' });
      }
      outputsViewport.focus({ preventScroll: true });
    }
    sessionStorage.setItem('outputs_scroll_pos', '0');
    sessionStorage.setItem('outputs_active_index', '0');
    sessionStorage.setItem('outputs_active_category', 'static-creatives');
    currentOutputsIndex = -1;
    setOutputsActiveCategory(0, true);

    // Initial render at scrollTop = 0 (hero visible, cards resting below frame)
    updateOutputsScroll();
  }

  function resetOutputsState() {
    clearTimeout(outputsLoaderTimer);
    if (outputsLoader) {
      outputsLoader.classList.add('loader-hidden');
    }
    if (outputsViewport) {
      outputsViewport.scrollTop = 0;
      if (typeof outputsViewport.scrollTo === 'function') {
        outputsViewport.scrollTo({ top: 0, behavior: 'instant' });
      }
    }
    currentOutputsIndex = -1;
    sessionStorage.removeItem('outputs_restore_active');
    sessionStorage.setItem('outputs_scroll_pos', '0');
    sessionStorage.setItem('outputs_active_index', '0');
    sessionStorage.setItem('outputs_active_category', 'static-creatives');
    setOutputsActiveCategory(0, true);
    updateOutputsScroll();
  }

  function setOutputsActiveCategory(index, immediate = false) {
    if (currentOutputsIndex === index && !immediate) return;
    currentOutputsIndex = index;

    // Background Title Typography (Giant letters behind center card)
    outputsBgTitles.forEach((word, idx) => {
      if (immediate) {
        word.style.transition = 'none';
      }
      word.classList.toggle('is-active', idx === index);
    });

    if (immediate) {
      // Force style recalculation so 'none' applies instantly without crossfade
      void (outputsBgTitles[0] && outputsBgTitles[0].offsetHeight);
      setTimeout(() => {
        outputsBgTitles.forEach((word) => {
          word.style.transition = '';
        });
      }, 150);
    }

    // Archive Counter
    if (outputsBgCounter) {
      outputsBgCounter.textContent = `0${index + 1} / 05`;
    }

    // Progress Dots
    outputsDots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === index);
    });
  }

  function updateOutputsScroll() {
    if (!outputsViewport || !outputsTrack || outputsCards.length === 0) return;

    const scrollTop = outputsViewport.scrollTop;
    sessionStorage.setItem('outputs_scroll_pos', scrollTop.toString());

    // 1. Mouse Parallax on Background Typography & Elements (moving subtly against cursor)
    if (outputsBgTitlesContainer) {
      const textShiftX = currentMouseX * -42; // px against cursor
      const textShiftY = currentMouseY * -24; // px against cursor
      outputsBgTitlesContainer.style.transform = `translate3d(${textShiftX.toFixed(2)}px, ${textShiftY.toFixed(2)}px, 0)`;
    }
    if (outputsBgElements) {
      const gridShiftX = currentMouseX * -15; // px against cursor
      const gridShiftY = currentMouseY * -10; // px against cursor
      outputsBgElements.style.transform = `translate3d(${gridShiftX.toFixed(2)}px, ${gridShiftY.toFixed(2)}px, 0)`;
    }

    const viewportHeight = outputsViewport.clientHeight || window.innerHeight;
    const heroHeight = outputsHero ? outputsHero.offsetHeight : viewportHeight;

    const peekStart = Math.max(0, heroHeight - 220);
    const entranceStart = heroHeight;
    const entranceEnd = heroHeight + 380;
    const peelStart = entranceEnd + 350; // Generous resting plateau for Card 0 (Static Creatives) so it remains easily clickable

    const cardHeight = outputsCards[0] ? (outputsCards[0].offsetHeight || (viewportHeight * 0.58)) : (viewportHeight * 0.58);
    const stageCenterY = viewportHeight / 2;
    const cardHalfHeight = cardHeight / 2;
    const sceneTopInViewport = Math.max(0, heroHeight - scrollTop);
    const peekHeight = 118; // px of card visible at bottom edge when fully peeked (clearly visible above dock)

    // --- PHASE 0: Pure Hero Section (scrollTop < peekStart) ---
    // User is browsing the hero. Cards are kept completely off-screen below frame.
    if (scrollTop < peekStart) {
      if (outputsHero) {
        if (scrollTop <= 0) {
          outputsHero.style.opacity = '1';
          outputsHero.style.transform = 'translate3d(0, 0, 0)';
        } else {
          const progress = Math.min(1, Math.max(0, scrollTop / heroHeight));
          outputsHero.style.opacity = Math.max(0, 1 - progress * 1.15).toFixed(2);
        }
      }

      const desiredTop = viewportHeight + 40; // fully below screen bottom
      const currentY = desiredTop - sceneTopInViewport - stageCenterY + cardHalfHeight;

      outputsCards.forEach((card, i) => {
        card.style.transform = `translate3d(0, ${currentY.toFixed(1)}px, 0) scale(0.92)`;
        card.style.opacity = '0';
        card.style.zIndex = (30 - i).toString();
        card.style.pointerEvents = 'none';
      });

      setOutputsActiveCategory(0);
      sessionStorage.setItem('outputs_active_index', '0');
      sessionStorage.setItem('outputs_active_category', 'static-creatives');
      return;
    }

    // Hero fades smoothly out as white section takes over
    if (outputsHero) {
      const heroProgress = Math.min(1, Math.max(0, scrollTop / heroHeight));
      outputsHero.style.opacity = Math.max(0, 1 - heroProgress * 1.15).toFixed(2);
    }

    // --- PHASE 0.5: Bottom-Edge Peeking (peekStart <= scrollTop < entranceStart) ---
    // "at just the moment before we reach the bottom of the scroll..."
    // The top of the cards peek over the bottom edge of the screen so user knows what's coming!
    // Fully reversible when scrolling back up into the hero!
    if (scrollTop < entranceStart) {
      const peekProgress = (scrollTop - peekStart) / (entranceStart - peekStart); // 0.0 to 1.0
      const eased = peekProgress * peekProgress * (3 - 2 * peekProgress); // Smoothstep curve

      const hiddenTop = viewportHeight + 40;
      const peekTop = viewportHeight - peekHeight;
      const desiredTop = hiddenTop * (1 - eased) + peekTop * eased;
      const currentY = desiredTop - sceneTopInViewport - stageCenterY + cardHalfHeight;
      const opacity = Math.min(1, Math.max(0, peekProgress * 2.2)).toFixed(2);

      const shiftX = (currentMouseX * -15).toFixed(2);
      const shiftY = (currentMouseY * -10).toFixed(2);
      const tiltX = (currentMouseY * -2.5).toFixed(2);
      const tiltY = (currentMouseX * 3.5).toFixed(2);
      const finalY = (currentY + parseFloat(shiftY)).toFixed(2);

      outputsCards.forEach((card, i) => {
        const rot = STACK_CONFIG[i].rotate;
        const scale = 0.94;
        card.style.transform = `translate3d(${shiftX}px, ${finalY}px, ${(STACK_CONFIG[i].translateZ || 0)}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotateZ(${rot}deg) scale(${scale})`;
        card.style.opacity = opacity;
        card.style.zIndex = (30 - i).toString();
        card.style.pointerEvents = (i === 0) ? 'auto' : 'none'; // Card 0 (Static Creatives) clickable on peeking edge
      });

      setOutputsActiveCategory(0);
      sessionStorage.setItem('outputs_active_index', '0');
      sessionStorage.setItem('outputs_active_category', 'static-creatives');
      return;
    }

    // --- PHASE 1: Scroll-Driven Cards Cascade Entrance (entranceStart <= scrollTop < entranceEnd) ---
    // As the user scrolls through this zone, the cards rise quick one over the other from the bottom edge
    // into the center stack! 100% scroll-driven and fully reversible when scrolling back up!
    if (scrollTop < entranceEnd) {
      const progress = (scrollTop - entranceStart) / (entranceEnd - entranceStart);

      outputsCards.forEach((card, i) => {
        // Stagger: card 4 (back) enters first, card 0 (front) lands last on top
        const order = 4 - i;
        const cardDelay = order * 0.12;
        const cardProgress = Math.min(1, Math.max(0, (progress - cardDelay) / (1 - cardDelay + 0.0001)));
        const eased = 1 - Math.pow(1 - cardProgress, 2.6);

        const peekTop = viewportHeight - peekHeight;
        const targetTop = stageCenterY - cardHalfHeight + STACK_CONFIG[i].translateY;
        const desiredTop = peekTop * (1 - eased) + targetTop * eased;
        const currentY = desiredTop - sceneTopInViewport - stageCenterY + cardHalfHeight;

        const currentRot = (STACK_CONFIG[i].rotate * 1.4) * (1 - eased) + STACK_CONFIG[i].rotate * eased;
        const currentScale = 0.94 * (1 - eased) + 1.0 * eased;
        const currentZ = (((STACK_CONFIG[i].translateZ || 0)) * eased).toFixed(1);

        const shiftX = (currentMouseX * -20).toFixed(2);
        const shiftY = (currentMouseY * -15).toFixed(2);
        const tiltX = (currentMouseY * -3.5).toFixed(2);
        const tiltY = (currentMouseX * 5.0).toFixed(2);
        const finalY = (currentY + parseFloat(shiftY)).toFixed(2);

        card.style.transform = `translate3d(${shiftX}px, ${finalY}px, ${currentZ}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotateZ(${currentRot.toFixed(2)}deg) scale(${currentScale.toFixed(4)})`;
        card.style.opacity = '1';
        card.style.zIndex = (30 - i).toString();
        card.style.pointerEvents = (i === 0) ? 'auto' : 'none'; // Card 0 (Static Creatives) strictly clickable throughout entrance
      });

      setOutputsActiveCategory(0);
      sessionStorage.setItem('outputs_active_index', '0');
      sessionStorage.setItem('outputs_active_category', 'static-creatives');
      return;
    }

    // --- PHASE 1.5: Deck Resting Stack & Mouse Parallax (entranceEnd <= scrollTop < peelStart) ---
    // All 5 cards are settled in the center stack before peeling begins
    if (scrollTop < peelStart) {
      // Card 0 held in center + resting mouse parallax
      const shiftX = (currentMouseX * -22).toFixed(2);
      const shiftY = (currentMouseY * -16).toFixed(2);
      const tiltX = (currentMouseY * -4.0).toFixed(2);
      const tiltY = (currentMouseX * 5.5).toFixed(2);

      outputsCards[0].style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0) rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotateZ(0deg) scale(1)`;
      outputsCards[0].style.opacity = '1';
      outputsCards[0].style.zIndex = '30';
      outputsCards[0].style.pointerEvents = 'auto';

      // Card 1 stacked underneath
      if (outputsCards[1]) {
        const underShiftX = (currentMouseX * -15).toFixed(2);
        const underShiftY = (currentMouseY * -11).toFixed(2);
        const underTiltX = (currentMouseY * -2.8).toFixed(2);
        const underTiltY = (currentMouseX * 3.8).toFixed(2);
        const underY = (STACK_CONFIG[1].translateY + parseFloat(underShiftY)).toFixed(2);

        outputsCards[1].style.transform = `translate3d(${underShiftX}px, ${underY}px, ${STACK_CONFIG[1].translateZ || -20}px) rotateX(${underTiltX}deg) rotateY(${underTiltY}deg) rotateZ(${STACK_CONFIG[1].rotate}deg) scale(1)`;
        outputsCards[1].style.opacity = '1';
        outputsCards[1].style.zIndex = '20';
        outputsCards[1].style.pointerEvents = 'none';
      }

      // Cards 2, 3, 4 stacked deeper
      for (let i = 2; i < outputsCards.length; i++) {
        const depthWeight = 0.45 + (outputsCards.length - 1 - i) * 0.12;
        const deepShiftX = (currentMouseX * -18 * depthWeight).toFixed(2);
        const deepShiftY = (currentMouseY * -13 * depthWeight).toFixed(2);
        const deepTiltX = (currentMouseY * -3.0 * depthWeight).toFixed(2);
        const deepTiltY = (currentMouseX * 4.0 * depthWeight).toFixed(2);
        const deepY = (STACK_CONFIG[i].translateY + parseFloat(deepShiftY)).toFixed(2);

        outputsCards[i].style.transform = `translate3d(${deepShiftX}px, ${deepY}px, ${STACK_CONFIG[i].translateZ || -40}px) rotateX(${deepTiltX}deg) rotateY(${deepTiltY}deg) rotateZ(${STACK_CONFIG[i].rotate}deg) scale(1)`;
        outputsCards[i].style.opacity = '1';
        outputsCards[i].style.zIndex = (10 - i).toString();
        outputsCards[i].style.pointerEvents = 'none';
      }

      setOutputsActiveCategory(0);
      sessionStorage.setItem('outputs_active_index', '0');
      sessionStorage.setItem('outputs_active_category', 'static-creatives');
      return;
    }

    // --- PHASE 2: Gallery 3D Perspective Peeling (scrollTop >= peelStart) ---
    const galleryPeelScroll = scrollTop - peelStart;
    const trackHeight = outputsTrack.offsetHeight;
    const maxScroll = Math.max(1, trackHeight - viewportHeight);
    const totalPeelDistance = Math.max(1, maxScroll - peelStart);

    const p = Math.min(Math.max(galleryPeelScroll / totalPeelDistance, 0), 1);

    const numSlots = 4;
    const slotSpan = 1.0 / numSlots; // 0.25 per card peel

    if (p >= 0.94) {
      // Settled on 5th and final slide (3D Works)
      for (let i = 0; i < 4; i++) {
        const exit = EXIT_CONFIG[i];
        outputsCards[i].style.transform = `translate3d(${exit.x}vw, ${exit.y}vh, ${exit.z}px) rotateX(${exit.rotX}deg) rotateY(${exit.rotY}deg) rotateZ(${exit.rotZ}deg) skewY(${exit.skewY}deg) scale(${exit.scale})`;
        outputsCards[i].style.opacity = '0';
        outputsCards[i].style.zIndex = '1';
        outputsCards[i].style.pointerEvents = 'none';
      }

      if (outputsCards[4]) {
        // Retain the exact tilted stack position for the final card (3D Works) + mouse parallax
        const shiftX = (currentMouseX * -22).toFixed(2);
        const shiftY = (currentMouseY * -16).toFixed(2);
        const tiltX = (currentMouseY * -4.0).toFixed(2);
        const tiltY = (currentMouseX * 5.5).toFixed(2);
        const finalY = (STACK_CONFIG[4].translateY + parseFloat(shiftY)).toFixed(2);

        outputsCards[4].style.transform = `translate3d(${shiftX}px, ${finalY}px, 0) rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotateZ(${STACK_CONFIG[4].rotate}deg) scale(1)`;
        outputsCards[4].style.opacity = '1';
        outputsCards[4].style.zIndex = '30';
        outputsCards[4].style.pointerEvents = 'auto';
      }
      setOutputsActiveCategory(4);
      sessionStorage.setItem('outputs_active_index', '4');
      sessionStorage.setItem('outputs_active_category', '3d-works');
      return;
    }

    // Active peeling slot k (0 to 3)
    const k = Math.min(3, Math.max(0, Math.floor(p / slotSpan)));
    const slotStart = k * slotSpan;
    const holdEnd = slotStart + slotSpan * 0.14; // Comfortable 14% hold for stable clicking, then active peel
    const slotEnd = slotStart + slotSpan;

    let activeCat = k;

    // 1. Cards that have already peeled away (i < k)
    for (let i = 0; i < k; i++) {
      const exit = EXIT_CONFIG[i];
      outputsCards[i].style.transform = `translate3d(${exit.x}vw, ${exit.y}vh, ${exit.z}px) rotateX(${exit.rotX}deg) rotateY(${exit.rotY}deg) rotateZ(${exit.rotZ}deg) skewY(${exit.skewY}deg) scale(${exit.scale})`;
      outputsCards[i].style.opacity = '0';
      outputsCards[i].style.zIndex = '1';
      outputsCards[i].style.pointerEvents = 'none';
    }

    // 2. Current slot card k
    if (p < holdEnd) {
      // Card k held steady in center + resting parallax
      const shiftX = (currentMouseX * -22).toFixed(2);
      const shiftY = (currentMouseY * -16).toFixed(2);
      const tiltX = (currentMouseY * -4.0).toFixed(2);
      const tiltY = (currentMouseX * 5.5).toFixed(2);

      outputsCards[k].style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0) rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotateZ(0deg) scale(1)`;
      outputsCards[k].style.opacity = '1';
      outputsCards[k].style.zIndex = '30';
      outputsCards[k].style.pointerEvents = 'auto';
      activeCat = k;

      // Card k + 1 waits stacked underneath (with depth weighting)
      if (k + 1 < outputsCards.length) {
        const underShiftX = (currentMouseX * -15).toFixed(2);
        const underShiftY = (currentMouseY * -11).toFixed(2);
        const underTiltX = (currentMouseY * -2.8).toFixed(2);
        const underTiltY = (currentMouseX * 3.8).toFixed(2);
        const underY = (STACK_CONFIG[k + 1].translateY + parseFloat(underShiftY)).toFixed(2);

        outputsCards[k + 1].style.transform = `translate3d(${underShiftX}px, ${underY}px, ${STACK_CONFIG[k + 1].translateZ || -20}px) rotateX(${underTiltX}deg) rotateY(${underTiltY}deg) rotateZ(${STACK_CONFIG[k + 1].rotate}deg) scale(1)`;
        outputsCards[k + 1].style.opacity = '1';
        outputsCards[k + 1].style.zIndex = '20';
        outputsCards[k + 1].style.pointerEvents = 'none';
      }
    } else {
      // Card k actively peeling in 3D perspective with forward depth, tilt, skew & scale
      const peelNorm = (p - holdEnd) / (slotEnd - holdEnd);
      const eased = peelNorm * peelNorm * (3 - 2 * peelNorm);
      const exit = EXIT_CONFIG[k];

      const peelCloseness = 1.0 + eased * 1.35; // scales up to 2.35 as card comes closer to user
      const shiftX = currentMouseX * -22 * peelCloseness;
      const shiftY = currentMouseY * -16 * peelCloseness;
      const tiltX = currentMouseY * -4.0 * peelCloseness;
      const tiltY = currentMouseX * 5.5 * peelCloseness;

      const x = exit.x * eased; // vw
      const y = exit.y * eased; // vh
      const z = exit.z * eased; // px forward in 3D
      const rotX = exit.rotX * eased + tiltX; // deg
      const rotY = exit.rotY * eased + tiltY; // deg
      const rotZ = exit.rotZ * eased; // deg
      const skewY = exit.skewY * eased; // deg (paper pamphlet flex)
      const scale = 1 + eased * (exit.scale - 1);
      const opacity = eased > 0.90 ? Math.max(0, (1 - eased) / 0.10) : 1; // Stay fully visible until edge

      outputsCards[k].style.transform = `translate3d(calc(${x}vw + ${shiftX.toFixed(2)}px), calc(${y}vh + ${shiftY.toFixed(2)}px), ${z}px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) rotateZ(${rotZ.toFixed(2)}deg) skewY(${skewY.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      outputsCards[k].style.opacity = opacity.toString();
      outputsCards[k].style.zIndex = '35'; // Floats on top while peeling
      outputsCards[k].style.pointerEvents = (eased < 0.92) ? 'auto' : 'none'; // Clicking peeling card opens category k

      // Card k + 1 revealed in center
      if (k + 1 < outputsCards.length) {
        const revShiftX = (currentMouseX * -20).toFixed(2);
        const revShiftY = (currentMouseY * -15).toFixed(2);
        const revTiltX = (currentMouseY * -3.5).toFixed(2);
        const revTiltY = (currentMouseX * 4.8).toFixed(2);

        if (k + 1 === 4) {
          // Retain the exact tilted stack position for the final card (3D Works)
          const finalY = (STACK_CONFIG[4].translateY + parseFloat(revShiftY)).toFixed(2);
          outputsCards[4].style.transform = `translate3d(${revShiftX}px, ${finalY}px, 0) rotateX(${revTiltX}deg) rotateY(${revTiltY}deg) rotateZ(${STACK_CONFIG[4].rotate}deg) scale(1)`;
        } else {
          outputsCards[k + 1].style.transform = `translate3d(${revShiftX}px, ${revShiftY}px, 0) rotateX(${revTiltX}deg) rotateY(${revTiltY}deg) rotateZ(0deg) scale(1)`;
        }
        outputsCards[k + 1].style.opacity = '1';
        outputsCards[k + 1].style.zIndex = '28';
        // Only make next card clickable once peel has progressed and title flips
        outputsCards[k + 1].style.pointerEvents = (peelNorm > 0.35) ? 'auto' : 'none';
      }

      // Flip active category when peel is > 35% through
      activeCat = peelNorm > 0.35 ? (k + 1) : k;
    }

    // 3. Deeper cards in the deck (i > k + 1)
    for (let i = k + 2; i < outputsCards.length; i++) {
      const depthWeight = 0.45 + (outputsCards.length - 1 - i) * 0.12;
      const deepShiftX = (currentMouseX * -18 * depthWeight).toFixed(2);
      const deepShiftY = (currentMouseY * -13 * depthWeight).toFixed(2);
      const deepTiltX = (currentMouseY * -3.0 * depthWeight).toFixed(2);
      const deepTiltY = (currentMouseX * 4.0 * depthWeight).toFixed(2);
      const deepY = (STACK_CONFIG[i].translateY + parseFloat(deepShiftY)).toFixed(2);

      outputsCards[i].style.transform = `translate3d(${deepShiftX}px, ${deepY}px, ${STACK_CONFIG[i].translateZ || -40}px) rotateX(${deepTiltX}deg) rotateY(${deepTiltY}deg) rotateZ(${STACK_CONFIG[i].rotate}deg) scale(1)`;
      outputsCards[i].style.opacity = '1';
      outputsCards[i].style.zIndex = (10 - i).toString();
      outputsCards[i].style.pointerEvents = 'none';
    }

    setOutputsActiveCategory(activeCat);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem('outputs_active_index', activeCat.toString());
        const categorySlugs = ['static-creatives', 'motion-graphics', 'reels-video', 'ad-campaigns', '3d-works'];
        sessionStorage.setItem('outputs_active_category', categorySlugs[activeCat] || 'static-creatives');
      }
    } catch (e) {}
  }

  // Record scroll position and active category whenever clicking a card to open category.html
  outputsCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.setItem('outputs_restore_active', 'true');
          if (outputsViewport) {
            sessionStorage.setItem('outputs_scroll_pos', outputsViewport.scrollTop.toString());
          }
          const idx = card.getAttribute('data-index');
          if (idx !== null) {
            sessionStorage.setItem('outputs_active_index', idx);
          }
          const cat = card.getAttribute('data-category');
          if (cat) {
            sessionStorage.setItem('outputs_active_category', cat);
          }
        }
      } catch (err) {}
      const href = card.getAttribute('href');
      if (href && !e.defaultPrevented) {
        // Explicit navigation ensures immediate response
        window.location.href = href;
      }
    });
  });

  // Scroll and mouse listeners on outputsViewport (instant 0ms scroll responsiveness + mouse parallax)
  if (outputsViewport) {
    outputsViewport.addEventListener('scroll', () => {
      updateOutputsScroll();
    }, { passive: true });

    outputsViewport.addEventListener('mousemove', onOutputsMouseMove, { passive: true });
    outputsViewport.addEventListener('mouseleave', onOutputsMouseLeave, { passive: true });
  }

  // Ensure mouse wheel scrolling always operates outputsViewport smoothly when cursor is outside viewport,
  // BUT NEVER when Start Menu or Your Move window is open or cursor is hovering over them!
  window.addEventListener('wheel', (e) => {
    if (isStartMenuOpen || 
        (typeof isYourMoveOpen !== 'undefined' && isYourMoveOpen) || 
        (startMenuHuman && startMenuHuman.contains(e.target)) || 
        (startMenuBackdrop && startMenuBackdrop.contains(e.target)) ||
        (windowYourMove && windowYourMove.contains(e.target)) ||
        (yourMoveBackdrop && yourMoveBackdrop.contains(e.target))) {
      return;
    }
    if (currentSectionId === 'the-outputs' && outputsViewport) {
      if (!outputsViewport.contains(e.target)) {
        outputsViewport.scrollTop += e.deltaY;
      }
    }
  }, { passive: true });

  // Scroll cue click handler: smoothly scroll down to bring cards into the center stack
  const outputsScrollCue = document.querySelector('.outputs-scroll-cue');
  if (outputsScrollCue && outputsViewport) {
    outputsScrollCue.addEventListener('click', () => {
      const vh = outputsViewport.clientHeight || window.innerHeight;
      const heroH = outputsHero ? outputsHero.offsetHeight : vh;
      outputsViewport.scrollTo({ top: heroH + 380 + 100, behavior: 'smooth' });
    });
  }

  // Restore The Outputs state function
  function restoreOutputsView() {
    const params = new URLSearchParams(window.location.search);
    const urlCat = params.get('cat');
    const urlIdx = params.get('idx');
    const savedCat = urlCat || sessionStorage.getItem('outputs_active_category') || 'static-creatives';
    const catMap = {
      'static-creatives': 0,
      'social-media': 0,
      'motion-graphics': 1,
      'reels-video': 2,
      'ad-campaigns': 3,
      '3d-works': 4
    };
    let targetIndex = -1;
    if (urlIdx !== null && !isNaN(parseInt(urlIdx, 10))) {
      targetIndex = parseInt(urlIdx, 10);
    } else {
      const savedIndexRaw = sessionStorage.getItem('outputs_active_index');
      if (savedIndexRaw !== null && !isNaN(parseInt(savedIndexRaw, 10))) {
        targetIndex = parseInt(savedIndexRaw, 10);
      } else if (savedCat && catMap[savedCat] !== undefined) {
        targetIndex = catMap[savedCat];
      }
    }

    if (targetIndex < 0 || isNaN(targetIndex) || targetIndex > 4) {
      targetIndex = 0;
    }

    // Keep session storage synced
    sessionStorage.setItem('outputs_restore_active', 'true');
    sessionStorage.setItem('outputs_active_index', targetIndex.toString());
    sessionStorage.setItem('outputs_active_category', savedCat);

    // Dynamic scroll calculation based on targetIndex
    const vh = outputsViewport ? outputsViewport.clientHeight : window.innerHeight;
    const heroH = outputsHero ? outputsHero.offsetHeight : vh;
    const peelSt = heroH + 730;
    const maxScroll = Math.max(1, (outputsTrack ? outputsTrack.offsetHeight : (vh * 6)) - vh);
    const totalPeel = Math.max(1, maxScroll - peelSt);

    let finalScroll = peelSt + 20;
    if (targetIndex === 1) {
      finalScroll = Math.round(peelSt + 0.27 * totalPeel);
    } else if (targetIndex === 2) {
      finalScroll = Math.round(peelSt + 0.52 * totalPeel);
    } else if (targetIndex === 3) {
      finalScroll = Math.round(peelSt + 0.77 * totalPeel);
    } else if (targetIndex === 4) {
      finalScroll = maxScroll;
    }

    // 1. Immediately apply the correct active category directly with NO transition
    setOutputsActiveCategory(targetIndex, true);

    // Hide wallpaper
    wallpaperMind.hidden = true;
    wallpaperMind.classList.remove('is-active');

    // Hide other window tabs
    windowTabs.forEach((tab) => {
      if (tab.id !== 'section-the-outputs') {
        tab.hidden = true;
        tab.classList.remove('window-opened', 'window-scaling-in', 'window-scaling-out');
      }
    });

    // Open The Outputs directly
    const outputsWin = document.getElementById('section-the-outputs');
    if (outputsWin) {
      outputsWin.hidden = false;
      outputsWin.classList.remove('window-scaling-in', 'window-scaling-out');
      outputsWin.classList.add('window-opened');
      outputsWin.style.zIndex = 12;
    }

    // 2. Synchronously apply scroll position and card transforms BEFORE the browser paints
    if (outputsViewport) {
      outputsViewport.scrollTop = finalScroll;
    }
    updateOutputsScroll();

    currentSectionId = 'the-outputs';
    topZIndex = 12;

    folderButtons.forEach((btn) => {
      const isOutputs = btn.getAttribute('data-target') === 'the-outputs';
      btn.classList.toggle('is-active', isOutputs);
      btn.setAttribute('aria-selected', isOutputs ? 'true' : 'false');
    });

    // Hide loader immediately on restore
    if (outputsLoader) {
      outputsLoader.classList.add('loader-hidden');
    }

    // Keep active Outputs state in URL so page refreshes and browser history remain rock-solid
    history.replaceState(null, '', `index.html?restore=outputs&cat=${encodeURIComponent(savedCat)}&idx=${targetIndex}`);

    // Re-verify on next frame in case layout geometry needed an additional tick
    requestAnimationFrame(() => {
      if (outputsViewport && Math.abs(outputsViewport.scrollTop - finalScroll) > 5) {
        outputsViewport.scrollTop = finalScroll;
      }
      updateOutputsScroll();
      // Remove pre-paint temporary class once the first stable frame has painted cleanly
      setTimeout(() => {
        document.documentElement.classList.remove('is-restoring-outputs');
        document.documentElement.removeAttribute('data-restore-idx');
        document.documentElement.removeAttribute('data-restore-cat');
      }, 200);
    });
  }

  // --- 9. INITIAL LOAD SETUP & State Restoration ---
  const shouldRestoreOutputs = sessionStorage.getItem('outputs_restore_active') === 'true' || 
                               window.location.search.includes('restore=outputs');

  if (shouldRestoreOutputs) {
    restoreOutputsView();
  } else {
    document.documentElement.classList.remove('is-restoring-outputs');
    const urlParams = new URLSearchParams(window.location.search);
    const targetSectionParam = urlParams.get('section');
    const targetTabParam = urlParams.get('tab');
    const hash = window.location.hash.replace('#', '');

    if (targetSectionParam === 'the-human' || hash === 'the-human' || hash === 'details' || hash === 'experience') {
      const tabToOpen = targetTabParam || (hash === 'details' ? 'details' : (hash === 'experience' ? 'experience' : 'overview'));
      setTimeout(() => {
        openStartMenu(tabToOpen);
      }, 100);
    } else if (targetSectionParam === 'your-move' || hash === 'your-move') {
      setTimeout(() => {
        openYourMoveWindow();
      }, 100);
    } else {
      // Standard initial load directly to "The Mind" Home Screen
      if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname);
      }

      windowTabs.forEach((tab) => {
        tab.hidden = true;
        tab.classList.remove('window-opened', 'window-scaling-in', 'window-scaling-out');
      });

      wallpaperMind.hidden = false;
      wallpaperMind.classList.add('is-active');
      currentSectionId = 'the-mind';
      topZIndex = 10;

      folderButtons.forEach((btn) => {
        const isMind = btn.getAttribute('data-target') === 'the-mind';
        btn.classList.toggle('is-active', isMind);
        btn.setAttribute('aria-selected', isMind ? 'true' : 'false');
      });

      updateOutputsScroll();
    }
  }

  // Handle browser back/forward navigation (pageshow event)
  window.addEventListener('pageshow', (e) => {
    if (sessionStorage.getItem('outputs_restore_active') === 'true') {
      restoreOutputsView();
    }
  });

  // ==========================================================================
  // 10. BROWSER COLOR THEME MANAGEMENT
  // Defaults strictly to the browser's theme (prefers-color-scheme)
  // and dynamically updates in real-time when changed in the browser.
  // ==========================================================================
  const mediaQueryLight = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;

  function getBrowserTheme() {
    return (mediaQueryLight && mediaQueryLight.matches) ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    const validTheme = (theme === 'light' || theme === 'dark') ? theme : getBrowserTheme();
    document.documentElement.setAttribute('data-theme', validTheme);
    if (document.body) {
      document.body.setAttribute('data-theme', validTheme);
    }
    
    // Update theme-color meta tag for browser UI / mobile address bar
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', validTheme === 'light' ? '#f4f4f4' : '#191919');
    }
  }

  // Listen for live browser color theme switches and update immediately
  function onBrowserThemeChange(e) {
    const newTheme = e.matches ? 'light' : 'dark';
    applyTheme(newTheme);
  }

  if (mediaQueryLight) {
    if (mediaQueryLight.addEventListener) {
      mediaQueryLight.addEventListener('change', onBrowserThemeChange);
    } else if (mediaQueryLight.addListener) {
      mediaQueryLight.addListener(onBrowserThemeChange);
    }
  }

  // Sync state on startup to match the browser's current theme
  applyTheme(getBrowserTheme());
});
