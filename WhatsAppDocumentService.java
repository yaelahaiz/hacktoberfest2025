package com.login.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import java.io.File;

import java.io.FileOutputStream;

@Service
public class WhatsAppDocumentService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${whatsapp.user-access-token}")
    private String userAccessToken;

    @Value("${whatsapp.version}")
    private String version;

    @Value("${whatsapp.phone-number-id}")
    private String phoneNumberId;

    private final RestTemplate restTemplate;
    private static final String BASE_URL = "https://graph.facebook.com";

    public WhatsAppDocumentService() {
        this.restTemplate = new RestTemplate();
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        String token = userAccessToken;
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        headers.setBearerAuth(token);
        return headers;
    }

    public String getDocumentId(File file) {
        try {
            String url = String.format("%s/%s/%s/media", BASE_URL, version, phoneNumberId);
            HttpHeaders headers = createHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("messaging_product", "whatsapp");
            body.add("file", new FileSystemResource(file));
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            var response = restTemplate.postForEntity(url, requestEntity, String.class);
            com.fasterxml.jackson.databind.JsonNode jsonNode = objectMapper.readTree(response.getBody());
            String mediaId = jsonNode.get("id").asText();
            return mediaId;
        } catch (HttpClientErrorException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload document to WhatsApp: " + e.getMessage(), e);
        }
    }

    public String sendDocumentMessage(String recipientPhoneNumber, byte[] documentBytes, String filename) {
        File tempFile = null;
        try {
            // Write bytes to a temp file
            tempFile = File.createTempFile("bonafide", ".pdf");
            try (FileOutputStream fos = new FileOutputStream(tempFile)) {
                fos.write(documentBytes);
            }
            String mediaId = getDocumentId(tempFile);
            String url = String.format("%s/%s/%s/messages", BASE_URL, version, phoneNumberId);
            HttpHeaders headers = createHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("messaging_product", "whatsapp");
            requestBody.put("recipient_type", "individual");
            requestBody.put("to", recipientPhoneNumber);
            requestBody.put("type", "document");
            Map<String, Object> document = new HashMap<>();
            document.put("id", mediaId);
            document.put("filename", filename);
            requestBody.put("document", document);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            var response = restTemplate.postForEntity(url, entity, String.class);
            return response.getBody();
        } catch (HttpClientErrorException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to send document message: " + e.getMessage(), e);
        } finally {
            if (tempFile != null && tempFile.exists()) {
                tempFile.delete();
            }
        }
    }
} 