export const environment = {
  production: false,
    keycloakConfig: {
        realm: 'digital-payment-hub',
        url: 'https://ids-hub.mytelpay.com.mm/',
        clientId: 'hub-fe',
    },
  baseUrl: {
    HUB: 'http://14.224.201.179:8081/api',
    LOGIN_URL: 'https://ids-hub.mytelpay.com.mm/realms/digital-payment-hub/protocol/openid-connect/token',
    GATEWAY_URL: 'https://gw.mytelpay.com.mm:9443/gateway' 
  }
};
