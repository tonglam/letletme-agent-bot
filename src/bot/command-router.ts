export type CommandRouteResult = {
  handled: false;
  message: string;
};

export function routeCommand(_input: string): CommandRouteResult {
  return {
    handled: false,
    message: "Bot commands are not implemented yet."
  };
}
