type StyleObject = { [key: string]: string | number };

interface BadgesModalStyles {
    overlay: StyleObject;
    content: StyleObject;
    title: StyleObject;
    badgeContainer: StyleObject;
    badge: StyleObject;
    badgeIcon: StyleObject;
    badgeTitle: StyleObject;
    badgeDescription: StyleObject;
    emptyState: StyleObject;
    button: StyleObject;
}

export interface Styles {
    badgesModal: BadgesModalStyles;
    badgesButton: StyleObject;
}

export const defaultStyles: Styles = {
    badgesModal: {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        content: {
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '20px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
        },
        title: {
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '20px',
        },
        badgeContainer: {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
        },
        badge: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: '10px',
        },
        badgeIcon: {
            width: '50px',
            height: '50px',
            marginBottom: '5px',
        },
        badgeTitle: {
            fontSize: '14px',
            textAlign: 'center',
            marginBottom: '5px',
        },
        badgeDescription: {
            fontSize: '12px',
            textAlign: 'center',
            color: '#666',
        },
        emptyState: {
            fontSize: '16px',
            textAlign: 'center',
            color: '#666',
            margin: '20px 0',
        },
        button: {
            backgroundColor: '#007bff',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            marginTop: '20px',
        },
    },
    badgesButton: {
        position: 'fixed',
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#ffffff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        zIndex: 1000,
        transition: 'transform 0.2s ease-in-out',
    },
};