import okhttp3.*;
import org.json.JSONObject;

import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;

public class Auth {

    private final String endpointURL;  // Endpoint URL for license authentication
    private boolean ssl = true;  // Flag indicating whether to use SSL

    private final MediaType JSON = MediaType.get("application/json");  // JSON media type
    private OkHttpClient client = new OkHttpClient();  // OkHttpClient for making HTTP requests

    /**
     * Constructor to initialize Auth instance with endpoint URL.
     * @param endpointURL The base URL of the authentication endpoint.
     */
    public Auth(String endpointURL) {
        this.endpointURL = endpointURL;
    }

    /**
     * Enable or disable SSL for HTTP requests.
     * @param enableSSL True to enable SSL, false otherwise.
     */
    public void enableSSL(boolean enableSSL) {
        this.ssl = enableSSL;
    }

    /**
     * Authenticate a license by sending a POST request with IP address and license key.
     * @param license The license key to authenticate.
     * @return True if the license is valid, false otherwise.
     * @throws IOException If an error occurs during the HTTP request.
     */
    public boolean authenticateLicense(String license) throws IOException {
        String ipAddress = getIPv4Address();  // Get IPv4 address of localhost
        String url = buildEndpointUrl("/licenses/auth");  // Build endpoint URL for license authentication
        String jsonString = postRequest(url, "{\"ip\": \"" + ipAddress + "\", \"license\": \"" + license + "\"}");  // Send POST request with IP and license key
        JSONObject jsonObject = new JSONObject(jsonString);  // Parse JSON response
        return jsonObject.getBoolean("valid");  // Return validity status from JSON response
    }

    /**
     * Get the IPv4 address of the localhost.
     * @return IPv4 address as a string.
     * @throws UnknownHostException If the IP address of localhost cannot be determined.
     */
    private String getIPv4Address() throws UnknownHostException {
        InetAddress localhost = InetAddress.getLocalHost();  // Get localhost InetAddress
        return getIPv4Address(localhost);  // Return IPv4 address as string
    }

    /**
     * Extract IPv4 address from InetAddress object.
     * @param inetAddress InetAddress object representing localhost.
     * @return IPv4 address as a string.
     */
    private String getIPv4Address(InetAddress inetAddress) {
        if (inetAddress != null) {
            String ip = inetAddress.getHostAddress();  // Get IP address as string
            if (inetAddress instanceof java.net.Inet4Address) {  // Check if InetAddress is IPv4
                return ip;  // Return IPv4 address
            }
        }
        return null;  // Return null if InetAddress is null or not IPv4
    }

    /**
     * Build the complete URL for the authentication endpoint.
     * @param endpoint The endpoint path for license authentication.
     * @return Complete URL as a string.
     */
    private String buildEndpointUrl(String endpoint) {
        String protocol = ssl ? "https" : "http";  // Determine protocol based on SSL flag
        return protocol + "://" + endpointURL + endpoint;  // Construct and return complete URL
    }

    /**
     * Send a POST request with JSON body to the specified URL.
     * @param url The URL to send the POST request to.
     * @param json The JSON body of the POST request.
     * @return Response body as a string.
     * @throws IOException If an error occurs during the HTTP request.
     */
    private String postRequest(String url, String json) throws IOException {
        RequestBody body = RequestBody.create(json, JSON);  // Create request body with JSON content
        Request request = new Request.Builder()  // Build HTTP POST request
                .url(url)  // Set request URL
                .post(body)  // Set request body
                .build();  // Build request

        try (Response response = client.newCall(request).execute()) {  // Execute HTTP request
            assert response.body() != null;
            return response.body().string();  // Return response body as string
        }
    }
}
