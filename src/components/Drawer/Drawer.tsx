import { FunctionComponent } from 'preact';
import { useEffect } from 'preact/hooks';

import { useSearch } from "../../context";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  totalCount: number;
}

export const Drawer: FunctionComponent<DrawerProps> = ({
  isOpen,
  onClose,
  totalCount,
  children,
}) => {
  const searchCtx = useSearch();

  const modalTabTrap = (modalElem: any) => {
    modalElem?.addEventListener('keydown', (event: KeyboardEvent) => {
      // Focus loop in cases of input element causing native focus trap break
      const focusableEls = Array.from(modalElem.querySelectorAll('a[href], button, input, textarea, select,'
        + 'details, [tabindex]:not([tabindex="-1"])')).filter((el) => !(el as HTMLElement)?.hasAttribute('disabled')
        && !(el as HTMLElement)?.getAttribute('aria-hidden'));
      const firstFocusableEl = focusableEls[0];
      const lastFocusableEl = focusableEls[focusableEls.length - 1];

      if (event.key === 'Tab' || event.keyCode === 9) {
        // if Shift + Tab focus on the last focusable elt
        if (event.shiftKey) {
          if (document.activeElement === firstFocusableEl) {
            (lastFocusableEl as HTMLElement)?.focus();
            event.preventDefault();
          }
          // else focus on the first focusable elt
        } else if (document.activeElement === lastFocusableEl) {
          (firstFocusableEl as HTMLElement)?.focus();
          event.preventDefault();
        }
      }
    });
  }

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('no-scroll');
      document.body.style.overflow = 'hidden';

      // ADA: set focus on first indexed element and trap tab movement insode modal
      const modalElem = document.querySelector('.mobile-filters-container');
      (modalElem?.querySelector('[tabindex]:not([tabindex="-1"])') as HTMLElement)?.focus();
      modalTabTrap(modalElem);
    } else {
      document.body.classList.remove('no-scroll');
      document.body.style.overflow = 'visible';
    }
  }, [isOpen]);

  const onClearFilter = () => {
    searchCtx.clearFilters();
    onClose();
  }

  const greyFilterClose = (event:any) => {
    const target = event.target

    if (target.classList.contains('mainBgContainer')) {
      onClose()
    }
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex bg-black bg-opacity-50 mainBgContainer"
          onClick={greyFilterClose}>
          <div
            className="relative mt-auto w-full bg-white h-[80%] md:h-full shadow-lg overflow-auto animate-slideUp pb-20 md:animate-slideRight md:max-w-[500px]">
            <div className="p-12">{children}</div>
          </div>
          <div
            class="apply-buttons absolute left-0 right-0 bottom-0 flex p-4 gap-4 md:animate-slideRight md:max-w-[485px] ">
            <button
              class="apply-buttons_button border border-solid border-black content-center h-20 flex-1 bg-white text-black capitalize"
              onClick={onClearFilter}>clear filters
            </button>
            <button
              class="apply-buttons_button border border-solid border-black content-center h-20 flex-1 bg-black text-white capitalize"
              onClick={onClose}>view {totalCount} results
            </button>
          </div>
        </div>
      )}
    </>
  );
};
