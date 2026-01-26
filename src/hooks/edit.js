export function useEdit(host) {
  return {
    state: { mode: "view", deleteSelected: [] },

    onLongpressItem({ detail }) {
      host.setState("mode", "edit");
      host.setState("deleteSelected", [
        ...host.state.deleteSelected,
        detail.id,
      ]);
    },

    onClickItem(id) {
      if (host.state.mode === "view") return;
      const isSelected = host.state.deleteSelected.includes(id);
      const result = isSelected
        ? host.state.deleteSelected.filter((item) => item !== id)
        : [...host.state.deleteSelected, id];

      host.setState("deleteSelected", result);
    },

    exitEdit() {
      host.setState("deleteSelected", []);
      host.setState("mode", "view");
    },
  };
}
