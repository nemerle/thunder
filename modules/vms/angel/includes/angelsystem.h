#ifndef ANGELSYSTEM_H
#define ANGELSYSTEM_H

#include <system.h>

class asIScriptEngine;
class asIScriptModule;
class asIScriptContext;
class asIScriptFunction;
class asIScriptObject;

class asSMessageInfo;

class MetaObject;

class AngelSystem : public ISystem {
public:
    AngelSystem                 ();
    ~AngelSystem                ();

    bool                        init                        ();

    const char                 *name                        () const;

    void                        update                      (Scene *);

    void                        reload                      ();

    void                        registerClasses             (asIScriptEngine *engine);

protected:
    void                        execute                     (asIScriptObject *object, asIScriptFunction *func);

    static void                 messageCallback             (const asSMessageInfo *msg, void *param);

    asIScriptEngine            *m_pScriptEngine;

    asIScriptModule            *m_pScriptModule;

    asIScriptContext           *m_pContext;
};

#endif // ANGELSYSTEM_H
