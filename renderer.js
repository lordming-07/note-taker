window.addEventListener('DOMContentLoaded', async () => {
    const textarea = document.getElementById('note');
    const saveBtn = document.getElementById('save');
    const statusEl = document.getElementById('save_status');
    const saveAsBtn = document.getElementById('save-as');
    const newNoteBtn = document.getElementById('new-note');
    const openFileBtn = document.getElementById('open-file');

    window.electronAPI.onMenuAction('menu-new-note', () => {
      newNoteBth.click();
    });
      window.electronAPI.onMenuAction('menu-open-file', () => {
      openFikeBtn.click();
    });
        window.electronAPI.onMenuAction('menu-save', () => {
      saveBth.click();
    });
        window.electronAPI.onMenuAction('menu-save-as', () => {
      saveAsBth.click();
    });

    let lastSavedText = '';
      let currentFilePath = null;

    const savedNote = await window.electronAPI.loadNote();
    textarea.value = savedNote;
    lastSavedText = savedNote;

    // Save As
    saveAsBtn.addEventListener('click', async () => {
        const result = await window.electronAPI.saveAs(textarea.value);
        if (result.success) {
            lastSavedText = textarea.value;
            statusEl.textContent = `Saved to ${result.filepath}`;
        }else {
            statusEl.textContent = 'Save cancelled';
        }
    });

    // New Note
    newNoteBtn.addEventListener('click', async () => {
        const result = await window.electronAPI.newNote();
        if (result.confirmed) {
            textarea.value = '';
            lastSavedText = '';
        }
    });
    openFileBtn.addEventListener('click', async () => {
    const result = await window.electronAPI.openFile();
    if (result.success) {
        textarea.value = result.content;
        lastSavedText = result.content;
    }
}); 

    // Auto Save
    let timer;
    textarea.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(async () => {
            await window.electronAPI.saveNote(textarea.value);
            lastSavedText = textarea.value;
        }, 2000);
    });

    // Manual Save
    saveBtn.addEventListener('click', async () => {
        try{
            const result = await window.electronAPI.smartSave(textarea.value, currentFilePath);
            lastSavedText = textarea.value;
            currentFilePath = result.filePath;
            statusEl.textContent = `Saved to ${result.filePath}`;
        } catch (error) {
            console.error('Save failed:', error);
                statusEl.textContent = 'Save failed';
        }


    });
});