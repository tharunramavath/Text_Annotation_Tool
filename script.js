const labels = [];
const annotations = [];
let isSelecting = false;

function addLabel() {
    const newLabel = document.getElementById("newLabel").value.trim();
    if (newLabel && !labels.includes(newLabel)) {
        labels.push(newLabel);
        updateLabelListAndDropdown();
        document.getElementById("newLabel").value = "";
    }
}

function editLabel(oldLabel) {
    const newLabel = prompt("Edit label:", oldLabel);
    if (newLabel && newLabel !== oldLabel) {
        const labelIndex = labels.indexOf(oldLabel);
        if (labelIndex !== -1) {
            labels[labelIndex] = newLabel;
        }
        updateLabelListAndDropdown();
    }
}

function deleteLabel(labelToDelete) {
    const labelIndex = labels.indexOf(labelToDelete);
    if (labelIndex !== -1) {
        labels.splice(labelIndex, 1);
    }
    updateLabelListAndDropdown();
}

function updateLabelListAndDropdown() {
    const labelList = document.getElementById("labelList");
    labelList.innerHTML = "";
    labels.forEach(label => {
        const listItem = document.createElement("li");
        listItem.textContent = label;

        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-container");

        const editIcon = document.createElement("i");
        editIcon.classList.add("fas", "fa-edit", "icon-button");
        editIcon.title = "Edit Label";
        editIcon.onclick = () => editLabel(label);

        const deleteIcon = document.createElement("i");
        deleteIcon.classList.add("fas", "fa-trash", "icon-button");
        deleteIcon.title = "Delete Label";
        deleteIcon.onclick = () => deleteLabel(label);

        buttonContainer.appendChild(editIcon);
        buttonContainer.appendChild(deleteIcon);
        listItem.appendChild(buttonContainer);
        labelList.appendChild(listItem);
    });

    const labelDropdown = document.getElementById("labelDropdown");
    labelDropdown.innerHTML = '<option value="">Select Label</option>';
    labels.forEach(label => {
        const option = document.createElement("option");
        option.value = label;
        option.textContent = label;
        labelDropdown.appendChild(option);
    });
}

function startSelectingText() {
    const textInput = document.getElementById("textInput");
    const selectedLabel = document.getElementById("labelDropdown").value;

    if (!selectedLabel) {
        alert("Please select a label first.");
        return;
    }

    isSelecting = true;
    textInput.style.cursor = "text";

    textInput.addEventListener("mouseup", function handleMouseUp() {
        if (isSelecting) {
            const textArea = textInput;
            const startIdx = textArea.selectionStart;
            const endIdx = textArea.selectionEnd;
            const selectedText = textArea.value.substring(startIdx, endIdx);

            if (selectedText) {
                annotations.push({
                    text: selectedText,
                    label: selectedLabel,
                    start: startIdx,
                    end: endIdx
                });

                renderAnnotations();
                renderAnnotationsOutput();
            } else {
                alert("No text selected. Please highlight text to annotate.");
            }

            isSelecting = false;
            textInput.style.cursor = "default";
        }

        textInput.removeEventListener("mouseup", handleMouseUp);
    });
}

function renderAnnotations() {
    const textInput = document.getElementById("textInput").value;
    let annotatedHTML = "";
    let currentIdx = 0;

    annotations.sort((a, b) => a.start - b.start).forEach((ann) => {
        annotatedHTML += textInput.slice(currentIdx, ann.start);
        annotatedHTML += `<span class="annotation-span" onclick="editOrDeleteAnnotation(${ann.start}, ${ann.end})">${ann.text} (${ann.label})</span>`;
        currentIdx = ann.end;
    });

    annotatedHTML += textInput.slice(currentIdx);
    document.getElementById("annotatedText").innerHTML = annotatedHTML;
}

function editOrDeleteAnnotation(startIdx, endIdx) {
    const selectedAnnotation = annotations.find((ann) => ann.start === startIdx && ann.end === endIdx);
    if (selectedAnnotation) {
        const action = prompt("Enter 'edit' to edit the annotation or 'delete' to delete it.");
        if (action === "edit") {
            const newLabel = prompt("Enter new label:", selectedAnnotation.label);
            if (newLabel) {
                selectedAnnotation.label = newLabel;
                renderAnnotations();
                renderAnnotationsOutput();
            }
        } else if (action === "delete") {
            const annotationIndex = annotations.indexOf(selectedAnnotation);
            annotations.splice(annotationIndex, 1);
            renderAnnotations();
            renderAnnotationsOutput();
        }
    }
}

function renderAnnotationsOutput() {
    // Group annotations by label
    const groupedAnnotations = {};

    annotations.forEach((ann) => {
        if (!groupedAnnotations[ann.label]) {
            groupedAnnotations[ann.label] = [];
        }
        groupedAnnotations[ann.label].push(ann.text);
    });

    const annotationsOutput = document.getElementById("annotationsOutput");
    annotationsOutput.innerHTML = "";

    Object.keys(groupedAnnotations).forEach((label) => {
        const labelText = `${label}: "${groupedAnnotations[label].join('", "')}"`;
        const annotationText = document.createElement("p");
        annotationText.textContent = labelText;
        annotationsOutput.appendChild(annotationText);
    });

    const downloadLink = document.getElementById("downloadBtn");
    downloadLink.href = createDownloadLink();
}

function createDownloadLink() {
    const annotationsText = annotations
        .map((ann) => `Text: "${ann.text}", Label: "${ann.label}"`)
        .join("\n");

    const blob = new Blob([annotationsText], { type: "text/plain" });
    return URL.createObjectURL(blob);
}

