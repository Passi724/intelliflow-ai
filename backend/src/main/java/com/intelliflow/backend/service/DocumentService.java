package com.intelliflow.backend.service;

import com.intelliflow.backend.dto.DocumentResponse;
import com.intelliflow.backend.entity.Document;
import com.intelliflow.backend.entity.User;
import com.intelliflow.backend.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final FileStorageService fileStorageService;

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

        return toResponse(document);
    }

    public List<DocumentResponse> listAll() {
        return documentRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
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
