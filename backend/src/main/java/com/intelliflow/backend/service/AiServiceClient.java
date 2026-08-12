package com.intelliflow.backend.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.net.http.HttpClient;
import java.util.List;

@Slf4j
@Service
public class AiServiceClient {

    private final RestClient restClient;

    public AiServiceClient(@Value("${app.ai-service.url}") String aiServiceUrl) {
        // FastAPI/uvicorn (h11) mishandles the JDK HttpClient's default HTTP/2
        // upgrade attempt over plaintext, so pin the client to HTTP/1.1.
        HttpClient httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .build();

        this.restClient = RestClient.builder()
                .baseUrl(aiServiceUrl)
                .requestFactory(new JdkClientHttpRequestFactory(httpClient))
                .build();
    }

    public void ingest(String documentId, String filename, String text) {
        try {
            restClient.post()
                    .uri("/api/ingest")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new IngestRequest(documentId, filename, text))
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            log.warn("Failed to ingest document {} into ai-service: {}", documentId, e.getMessage());
        }
    }

    public List<SearchResult> search(String query, int topK) {
        SearchResponse response = restClient.post()
                .uri("/api/search")
                .contentType(MediaType.APPLICATION_JSON)
                .body(new SearchRequest(query, topK))
                .retrieve()
                .body(SearchResponse.class);

        return response != null ? response.results() : List.of();
    }

    public ChatResponse chat(String query, int topK) {
        try {
            ChatResponse response = restClient.post()
                    .uri("/api/chat")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ChatRequest(query, topK))
                    .retrieve()
                    .body(ChatResponse.class);

            if (response == null) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "The assistant returned no response.");
            }
            return response;
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Chat request to ai-service failed: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "The assistant is unavailable right now.");
        }
    }

    private record IngestRequest(
            @JsonProperty("document_id") String documentId,
            String filename,
            String text) {
    }

    private record SearchRequest(
            String query,
            @JsonProperty("top_k") int topK) {
    }

    public record SearchResult(
            @JsonProperty("document_id") String documentId,
            String filename,
            @JsonProperty("chunk_index") int chunkIndex,
            String text,
            double score) {
    }

    private record SearchResponse(List<SearchResult> results) {
    }

    private record ChatRequest(
            String query,
            @JsonProperty("top_k") int topK) {
    }

    public record ChatSource(
            @JsonProperty("document_id") String documentId,
            String filename,
            @JsonProperty("chunk_index") int chunkIndex,
            double score) {
    }

    public record ChatResponse(String answer, List<ChatSource> sources) {
    }
}
