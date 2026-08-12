package com.intelliflow.backend.service;

import com.intelliflow.backend.dto.ChatAnswerResponse;
import com.intelliflow.backend.dto.DocumentResponse;
import com.intelliflow.backend.dto.SearchResultResponse;
import com.intelliflow.backend.entity.Document;
import com.intelliflow.backend.entity.User;
import com.intelliflow.backend.repository.DocumentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock
    private DocumentRepository documentRepository;
    @Mock
    private FileStorageService fileStorageService;
    @Mock
    private AiServiceClient aiServiceClient;
    @Mock
    private TextExtractor textExtractor;

    @InjectMocks
    private DocumentService documentService;

    @Test
    void uploadRejectsEmptyFile() {
        MockMultipartFile empty = new MockMultipartFile("file", "empty.txt", "text/plain", new byte[0]);

        assertThatThrownBy(() -> documentService.upload(empty, new User()))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void uploadStoresFileAndIngestsExtractedText() throws IOException {
        MockMultipartFile file = new MockMultipartFile("file", "notes.txt", "text/plain", "hello".getBytes());
        User uploader = new User();
        uploader.setEmail("uploader@example.com");

        // JPA assigns the generated id as a side effect of save(); simulate that
        // since the mocked repository doesn't actually persist anything.
        when(documentRepository.save(any(Document.class))).thenAnswer(invocation -> {
            Document document = invocation.getArgument(0);
            document.setId(UUID.randomUUID());
            return document;
        });
        when(textExtractor.extract(file)).thenReturn("hello world");

        DocumentResponse response = documentService.upload(file, uploader);

        assertThat(response.getFilename()).isEqualTo("notes.txt");
        assertThat(response.getUploadedByEmail()).isEqualTo("uploader@example.com");

        verify(fileStorageService).upload(anyString(), eq(file));
        verify(aiServiceClient).ingest(anyString(), eq("notes.txt"), eq("hello world"));
    }

    @Test
    void uploadSkipsIngestionWhenExtractedTextIsBlank() throws IOException {
        MockMultipartFile file = new MockMultipartFile("file", "empty-ish.txt", "text/plain", "x".getBytes());
        User uploader = new User();
        uploader.setEmail("uploader@example.com");

        when(textExtractor.extract(file)).thenReturn("   ");

        documentService.upload(file, uploader);

        verify(aiServiceClient, never()).ingest(anyString(), anyString(), anyString());
    }

    @Test
    void searchMapsAiServiceResultsToResponseDtos() {
        when(aiServiceClient.search("intelliflow", 5)).thenReturn(List.of(
                new AiServiceClient.SearchResult("doc-1", "roadmap.pdf", 0, "some text", 0.9)
        ));

        List<SearchResultResponse> results = documentService.search("intelliflow");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getDocumentId()).isEqualTo("doc-1");
        assertThat(results.get(0).getFilename()).isEqualTo("roadmap.pdf");
        assertThat(results.get(0).getScore()).isEqualTo(0.9);
    }

    @Test
    void chatMapsAiServiceAnswerToResponseDto() {
        when(aiServiceClient.chat("what is intelliflow", 5)).thenReturn(
                new AiServiceClient.ChatResponse(
                        "IntelliFlow is a knowledge assistant.",
                        List.of(new AiServiceClient.ChatSource("doc-1", "onboarding.txt", 0, 0.8))
                )
        );

        ChatAnswerResponse response = documentService.chat("what is intelliflow");

        assertThat(response.getAnswer()).isEqualTo("IntelliFlow is a knowledge assistant.");
        assertThat(response.getSources()).hasSize(1);
        assertThat(response.getSources().get(0).getFilename()).isEqualTo("onboarding.txt");
    }
}
