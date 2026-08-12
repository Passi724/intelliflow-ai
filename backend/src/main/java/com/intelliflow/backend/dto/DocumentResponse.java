package com.intelliflow.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class DocumentResponse {
    private UUID id;
    private String filename;
    private String contentType;
    private long sizeBytes;
    private String uploadedByEmail;
    private Instant createdAt;
}
