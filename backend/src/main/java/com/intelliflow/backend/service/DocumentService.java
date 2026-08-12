package com.intelliflow.backend.service;

import com.intelliflow.backend.dto.DocumentResponse;
import com.intelliflow.backend.dto.SearchResultResponse;
import com.intelliflow.backend.entity.Document;
import com.intelliflow.backend.entity.User;
import com.intelliflow.backend.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final FileStorageService fileStorageService;
    private final AiServiceClient aiServiceClient;

    public DocumentResponse upload(MultipartFile file, User uploader) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty");
        }

        String storageKey = UUID.randomUUID() + "-" + file.getOriginalFilename();
        fileStorageService.upload(storageKey, file);

        Document document = new Document();
        document.setFilename(file.getOriginalFilename());
        document.setStorageKey(storageKey);
        document.setContentType(file.getContentType());
        document.setSizeBytes(file.getSize());
        document.setUploadedBy(uploader);

        documentRepository.save(document);

        ingestForSearch(document, file);

        return toResponse(document);
    }

    public List<DocumentResponse> listAll() {
        return documentRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<SearchResultResponse> search(String query) {
        return aiServiceClient.search(query, 5).stream()
                .map(r -> new SearchResultResponse(r.documentId(), r.filename(), r.chunkIndex(), r.text(), r.score()))
                .collect(Collectors.toList());
    }

    private void ingestForSearch(Document document, MultipartFile file) {
        // Best-effort UTF-8 decode; only meaningful for text-like uploads until a
        // proper per-content-type extractor (PDF, DOCX, ...) is added.
        String text;
        try {
            text = new String(file.getBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.warn("Could not read bytes for document {} to index for search", document.getId());
            return;
        }

        aiServiceClient.ingest(document.getId().toString(), document.getFilename(), text);
    }

    private DocumentResponse toResponse(Document document) {
        return new DocumentResponse(
                document.getId(),
                document.getFilename(),
                document.getContentType(),
                document.getSizeBytes(),
                document.getUploadedBy().getEmail(),
                document.getCreatedAt()
        );
    }
}
