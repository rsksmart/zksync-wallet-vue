import { Context, Plugin } from "@nuxt/types";
import mixpanel from "mixpanel-browser";
import { Inject } from "@nuxt/types/app";

export type Analytics = {
  track(eventName: string, props?: any): void;
  set(props: { [key: string]: string }): void;
};

class MixpanelAnalytics implements Analytics {
  constructor(token: string) {
    mixpanel.init(token, { debug: false, api_host: "/tunnel/mixpanel" });
  }

  set(props: { [key: string]: string }): void {
    if (!props) {
      return;
    }
    mixpanel.register(props);
  }

  track(eventName: string, props?: any): void {
    mixpanel.track(eventName, props);
  }
}

class ConsoleAnalytics implements Analytics {
  props = {};

  set(props: { [key: string]: string }): void {
    if (!props) {
      return;
    }
    for (const key of Object.keys(props)) {
      this.props[key] = sanitize(props[key]);
    }
  }

  track(eventName: string, props?: any): void {
    console.log("Track:", sanitize(eventName), { ...this.props, ...props });
  }
}

const sanitize = (value: any) => {
  if (typeof value === "string") {
    // Use a regular expression to replace characters that can be used in XSS attacks
    return value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  } else {
    // If the value is not a string, simply return it as is
    return value;
  }
};

const pluginAnalytics: Plugin = ({ $config }: Context, inject: Inject) => {
  console.log("analytics injected", $config);
  inject(
    "analytics",
    $config.mixpanel.isProduction ? new MixpanelAnalytics($config.mixpanel.token) : new ConsoleAnalytics()
  );
};

export default pluginAnalytics;
