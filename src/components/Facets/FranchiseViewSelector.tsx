import { FunctionComponent } from 'preact';

import { useSearch, useTranslation} from "../../context";
import FranchiseView from "../../icons/franchiseview.svg";
import PlpView from "../../icons/plpview.svg";

export const FranchiseViewSelector: FunctionComponent = () => {
  const searchCtx = useSearch();
  const translation = useTranslation();

  return (
    <div className="flex gap-[10px] md:pl-24 franchise-selector">
      <button disabled={searchCtx.displayFranchises} onClick={() => searchCtx.toggleFranchiseView(true)} aria-label={translation.ListView.franchiseView}>
        <FranchiseView aria-hidden="true" focusable="false" />
      </button>
      <button disabled={!searchCtx.displayFranchises} onClick={() => searchCtx.toggleFranchiseView(false)} aria-label={translation.ListView.listView}>
        <PlpView aria-hidden="true" focusable="false" />
      </button>
    </div>
  );
}
