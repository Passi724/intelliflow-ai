from app.chunking import chunk_text


def test_empty_text_produces_no_chunks():
    assert chunk_text("") == []
    assert chunk_text("   ") == []


def test_short_text_produces_single_chunk():
    assert chunk_text("hello world", chunk_size=800) == ["hello world"]


def test_long_text_is_split_with_overlap():
    # Non-repeating content so the overlap assertion below can't pass by
    # coincidence the way it would on a uniform string.
    text = "".join(chr(ord("a") + i % 26) for i in range(1000))

    chunks = chunk_text(text, chunk_size=400, overlap=50)

    assert len(chunks) > 1
    assert all(len(chunk) <= 400 for chunk in chunks)
    # Consecutive chunks share the overlap region.
    assert chunks[0][-50:] == chunks[1][:50]


def test_chunks_cover_the_full_text_with_no_gaps():
    text = "0123456789" * 50

    chunks = chunk_text(text, chunk_size=120, overlap=20)
    reconstructed = chunks[0]
    for chunk in chunks[1:]:
        reconstructed += chunk[20:]

    assert reconstructed == text
