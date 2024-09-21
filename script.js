(function() {
    let db;
    let currentEditId = null;

    const request = indexedDB.open("EinsatzDB", 1);

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        const objectStore = db.createObjectStore("Einsaetze", { keyPath: "id", autoIncrement: true });
        objectStore.createIndex("wochentag", "wochentag", { unique: false });
        objectStore.createIndex("name", "name", { unique: false });
        objectStore.createIndex("beschreibung", "beschreibung", { unique: false });
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        displayEinsaetze();
    };

    request.onerror = function(event) {
        console.error("Fehler beim Öffnen der Datenbank:", event.target.errorCode);
    };

    document.getElementById('einsatzForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const wochentag = document.getElementById('wochentag').value;
        const name = document.getElementById('name').value.trim();
        const startZeit = document.getElementById('startZeit').value;
        const endZeit = document.getElementById('endZeit').value;
        const arbeitszeit = berechneArbeitszeit(startZeit, endZeit);
        const beschreibung = document.getElementById('beschreibung').value.trim();

        if (arbeitszeit <= 0) {
            alert('Ungültige Arbeitszeit! Endzeit muss nach der Startzeit liegen.');
            return;
        }

        if (currentEditId === null) {
            const einsatz = {
                wochentag: wochentag,
                name: name,
                startZeit: startZeit,
                endZeit: endZeit,
                arbeitszeit: arbeitszeit,
                beschreibung: beschreibung
            };
            speicherEinsatz(einsatz);
        } else {
            const einsatz = {
                id: currentEditId,
                wochentag: wochentag,
                name: name,
                startZeit: startZeit,
                endZeit: endZeit,
                arbeitszeit: arbeitszeit,
                beschreibung: beschreibung
            };
            updateEinsatz(einsatz);
        }
    });

    function berechneArbeitszeit(startZeit, endZeit) {
        const start = new Date(`1970-01-01T${startZeit}`);
        const end = new Date(`1970-01-01T${endZeit}`);
        const diff = (end - start) / (1000 * 60); // Minuten
        document.getElementById('arbeitszeit').value = diff > 0 ? diff : 0;
        return diff;
    }

    function speicherEinsatz(einsatz) {
        const transaction = db.transaction(["Einsaetze"], "readwrite");
        const objectStore = transaction.objectStore("Einsaetze");
        const request = objectStore.add(einsatz);

        request.onsuccess = function() {
            document.getElementById('einsatzForm').reset();
            document.getElementById('arbeitszeit').value = '';
            displayEinsaetze();
            showToast('Einsatz erfolgreich gespeichert.');
        };

        request.onerror = function(event) {
            console.error("Fehler beim Speichern:", event.target.error);
        };
    }

    function displayEinsaetze() {
        const transaction = db.transaction(["Einsaetze"], "readonly");
        const objectStore = transaction.objectStore("Einsaetze");
        const request = objectStore.openCursor();
        const tableBody = document.getElementById('einsatzTableBody');
        tableBody.innerHTML = '';

        request.onsuccess = function(event) {
            const cursor = event.target.result;
            if (cursor) {
                const einsatz = cursor.value;
                const row = document.createElement('tr');

                const datumCell = document.createElement('td');
                const datum = new Date(einsatz.wochentag);
                datumCell.textContent = datum.toLocaleDateString('de-DE');
                row.appendChild(datumCell);

                const nameCell = document.createElement('td');
                nameCell.textContent = einsatz.name;
                row.appendChild(nameCell);

                const startZeitCell = document.createElement('td');
                startZeitCell.textContent = einsatz.startZeit;
                row.appendChild(startZeitCell);

                const endZeitCell = document.createElement('td');
                endZeitCell.textContent = einsatz.endZeit;
                row.appendChild(endZeitCell);

                const arbeitszeitCell = document.createElement('td');
                arbeitszeitCell.textContent = einsatz.arbeitszeit;
                row.appendChild(arbeitszeitCell);

                const beschreibungCell = document.createElement('td');
                beschreibungCell.textContent = einsatz.beschreibung;
                row.appendChild(beschreibungCell);

                const aktionenCell = document.createElement('td');
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Löschen';
                deleteButton.addEventListener('click', () => deleteEinsatz(einsatz.id));
                aktionenCell.appendChild(deleteButton);

                row.appendChild(aktionenCell);
                tableBody.appendChild(row);

                cursor.continue();
            }
        };
    }

    function deleteEinsatz(id) {
        const transaction = db.transaction(["Einsaetze"], "readwrite");
        const objectStore = transaction.objectStore("Einsaetze");
        const request = objectStore.delete(id);

        request.onsuccess = function() {
            displayEinsaetze();
            showToast('Einsatz erfolgreich gelöscht.');
        };

        request.onerror = function(event) {
            console.error("Fehler beim Löschen:", event.target.error);
        };
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'alert alert-success';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
})();
