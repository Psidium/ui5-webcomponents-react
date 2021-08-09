import { enrichEventWithDetails } from '@ui5/webcomponents-react-base/dist/Utils';
import { TableSelectionBehavior } from '@ui5/webcomponents-react/dist/TableSelectionBehavior';
import { TableSelectionMode } from '@ui5/webcomponents-react/dist/TableSelectionMode';

const tagNamesWhichShouldNotSelectARow = new Set([
  'UI5-AVATAR',
  'UI5-BUTTON',
  'UI5-CALENDAR',
  'UI5-CHECKBOX',
  'UI5-COLOR-PICKER',
  'UI5-COMBOBOX',
  'UI5-DATE-PICKER',
  'UI5-DATERANGE-PICKER',
  'UI5-DATETIME-PICKER',
  'UI5-DURATION-PICKER',
  'UI5-FILE-UPLOADER',
  'UI5-ICON',
  'UI5-INPUT',
  'UI5-LINK',
  'UI5-MULTI-COMBOBOX',
  'UI5-MULTI-INPUT',
  'UI5-RADIO-BUTTON',
  'UI5-RANGE-SLIDER',
  'UI5-RATING-INDICATOR',
  'UI5-SEGMENTED-BUTTON',
  'UI5-SELECT',
  'UI5-SLIDER',
  'UI5-STEP-INPUT',
  'UI5-SWITCH',
  'UI5-TEXT-AREA',
  'UI5-TIME-PICKER',
  'UI5-TOGGLE-BUTTON',
  'UI5-UPLOAD-COLLECTION'
]);

const getRowProps = (rowProps, { row, instance }) => {
  const { webComponentsReactProperties, toggleRowSelected, selectedFlatRows } = instance;
  const handleRowSelect = (e, selectionCellClick = false) => {
    if (
      e.target?.dataset?.name !== 'internal_selection_column' &&
      !(e.markerAllowTableRowSelection === true || e.nativeEvent?.markerAllowTableRowSelection === true) &&
      tagNamesWhichShouldNotSelectARow.has(e.target.tagName)
    ) {
      return;
    }

    // dont select empty rows
    const isEmptyRow = row.original?.emptyRow;
    if (isEmptyRow) {
      return;
    }

    // dont select grouped rows
    if (row.isGrouped) {
      return;
    }

    const { selectionBehavior, selectionMode, onRowSelected, onRowClick } = webComponentsReactProperties;

    if (typeof onRowClick === 'function' && e.target?.dataset?.name !== 'internal_selection_column') {
      onRowClick(enrichEventWithDetails(e, { row }));
    }

    if (webComponentsReactProperties.selectionMode === TableSelectionMode.NONE) {
      return;
    }

    // dont continue if the row was clicked and selection mode is row selector only
    if (selectionBehavior === TableSelectionBehavior.ROW_SELECTOR && !selectionCellClick) {
      return;
    }

    if (selectionMode === TableSelectionMode.SINGLE_SELECT) {
      for (const row of selectedFlatRows) {
        toggleRowSelected(row.id, false);
      }
    }
    instance.toggleRowSelected(row.id);

    // fire event
    if (typeof onRowSelected === 'function') {
      const payload = {
        row,
        isSelected: !row.isSelected,
        selectedFlatRows: !row.isSelected ? [row.id] : []
      };
      if (selectionMode === TableSelectionMode.MULTI_SELECT) {
        payload.selectedFlatRows = !row.isSelected
          ? [...selectedFlatRows, row]
          : selectedFlatRows.filter((prevRow) => prevRow.id !== row.id);
      }
      onRowSelected(enrichEventWithDetails(e, payload));
    }
  };
  return [
    rowProps,
    {
      onKeyUp: (e, selectionCellClick = false) => {
        if (e.key === 'Enter') {
          handleRowSelect(e, selectionCellClick);
        }
      },
      onClick: handleRowSelect
    }
  ];
};

export const useSingleRowStateSelection = (hooks) => {
  hooks.getRowProps.push(getRowProps);
};
useSingleRowStateSelection.pluginName = 'useSingleRowStateSelection';
