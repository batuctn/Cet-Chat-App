import { createContext } from "react";

export const GroupChatUserContext = createContext({
  senderInfoGroup: {},
  setSenderInfoGroup: () => {},
});
