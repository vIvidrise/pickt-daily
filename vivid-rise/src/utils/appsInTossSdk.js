/**
 * 앱인토스 SDK 브릿지 (한 눈에 보기 레퍼런스 대응)
 * - 호스트가 주입한 전역 객체 기준으로 동작. SDK 미주입 시 no-op/fallback.
 * @see https://developers-apps-in-toss.toss.im/bedrock/reference/framework/시작하기/overview.html
 */

const win = typeof window !== 'undefined' ? window : undefined;

function has(obj, key) {
  return obj != null && typeof obj[key] === 'function';
}

/** graniteEvent: 뒤로가기 버튼 이벤트 등 */
export function getGraniteEvent() {
  return win?.graniteEvent ?? null;
}

/** appsInTossEvent: 앱 진입 완료(entryMessageExited) 등 */
export function getAppsInTossEvent() {
  return win?.appsInTossEvent ?? null;
}

/** closeView: 현재 미니앱 화면 닫기 */
export function getCloseView() {
  return win?.closeView ?? null;
}

/** openURL: 외부 URL을 기본 브라우저/앱으로 열기 */
export function getOpenURL() {
  return win?.openURL ?? null;
}

/** Storage: 네이티브 저장소 (기기 변경 시 데이터 유지 권장) */
export function getStorage() {
  return win?.Storage ?? null;
}

/** 뒤로가기 버튼 이벤트 구독. onEvent 시 기본 뒤로가기는 차단됨. */
export function subscribeBackEvent(onEvent, onError) {
  const graniteEvent = getGraniteEvent();
  if (!graniteEvent?.addEventListener) return () => {};
  try {
    const unsub = graniteEvent.addEventListener('backEvent', {
      onEvent: () => {
        if (typeof onEvent === 'function') onEvent();
      },
      onError: (e) => {
        if (typeof onError === 'function') onError(e);
      },
    });
    return typeof unsub === 'function' ? unsub : () => {};
  } catch (_) {
    return () => {};
  }
}

/** 앱 진입 완료(안내 메시지 사라짐) 이벤트 구독. 초기화/데이터 로딩 시점으로 사용. */
export function subscribeEntryMessageExited(onEvent, onError) {
  const appsInTossEvent = getAppsInTossEvent();
  if (!appsInTossEvent?.addEventListener) return () => {};
  try {
    const unsub = appsInTossEvent.addEventListener('entryMessageExited', {
      onEvent: () => {
        if (typeof onEvent === 'function') onEvent();
      },
      onError: (e) => {
        if (typeof onError === 'function') onError(e);
      },
    });
    return typeof unsub === 'function' ? unsub : () => {};
  } catch (_) {
    return () => {};
  }
}

/**
 * 화면 닫기. 앱인토스에서는 closeView(), 그 외에는 onFallback 호출(예: navigate('/')).
 */
export function closeView(onFallback) {
  const close = getCloseView();
  if (close && typeof close === 'function') {
    close().catch(() => {
      if (typeof onFallback === 'function') onFallback();
    });
    return;
  }
  if (typeof onFallback === 'function') onFallback();
}

/**
 * 외부 URL 열기. 앱인토스에서는 openURL(), 그 외에는 window.open.
 */
export function openExternalUrl(url) {
  const open = getOpenURL();
  if (open && typeof open === 'function') {
    open(url).catch(() => {
      win?.open?.(url, '_blank');
    });
    return;
  }
  win?.open?.(url, '_blank');
}

/**
 * 저장소 어댑터: 앱인토스면 Storage(네이티브), 아니면 localStorage.
 * @returns {{ getItem: (k: string) => Promise<string|null>, setItem: (k: string, v: string) => Promise<void>, removeItem: (k: string) => Promise<void>, clearItems: () => Promise<void> }}
 */
export function getStorageAdapter() {
  const Storage = getStorage();
  if (Storage?.getItem && Storage?.setItem) {
    return {
      async getItem(key) {
        try {
          return await Storage.getItem(key);
        } catch (_) {
          return null;
        }
      },
      async setItem(key, value) {
        try {
          await Storage.setItem(key, value);
        } catch (_) {}
      },
      async removeItem(key) {
        try {
          await Storage.removeItem(key);
        } catch (_) {}
      },
      async clearItems() {
        try {
          await Storage.clearItems?.();
        } catch (_) {}
      },
    };
  }
  return {
    async getItem(key) {
      try {
        return win?.localStorage?.getItem(key) ?? null;
      } catch (_) {
        return null;
      }
    },
    async setItem(key, value) {
      try {
        win?.localStorage?.setItem(key, value);
      } catch (_) {}
    },
    async removeItem(key) {
      try {
        win?.localStorage?.removeItem(key);
      } catch (_) {}
    },
    async clearItems() {
      try {
        win?.localStorage?.clear?.();
      } catch (_) {}
    },
  };
}
