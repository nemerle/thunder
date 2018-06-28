#pragma version

#pragma flags

#include ".embedded/Common.vert"
#include ".embedded/BRDF.frag"

layout(location = 0) in vec3 _vertex;
layout(location = 1) in vec2 _uv0;
layout(location = 2) in vec2 _uv1;
layout(location = 3) in vec3 _n;
layout(location = 4) in vec3 _t;
layout(location = 5) in vec3 _b;
layout(location = 6) in vec4 _color;

layout(location = 7) in vec3 _view;
layout(location = 8) in vec3 _proj;

layout(location = 2) uniform vec4   t_color;
layout(location = 3) uniform float _time;
layout(location = 4) uniform float _clip;

#pragma material

layout(location = 0) out vec4 gbuffer1;
layout(location = 1) out vec4 gbuffer2;
layout(location = 2) out vec4 gbuffer3;
layout(location = 3) out vec4 gbuffer4;

void simpleMode(Params params) {
    float alpha = getOpacity ( params );
    if(_clip >= alpha) {
        discard;
    }
    gbuffer1    = t_color;
}

void depthMode(Params params) {
    float depth = gl_FragCoord.z;
    float dx    = dFdx(depth);
    float dy    = dFdy(depth);
    float msqr  = depth * depth + 0.25 * (dx * dx + dy * dy);

    gbuffer1    = vec4(depth, msqr, 0.0, 0.0);
}

void passMode(Params params) {
    vec3 albd   = getDiffuse ( params ) * t_color.xyz;
    vec3 emit   = getEmissive( params ) * t_color.xyz;
    float alpha = getOpacity ( params ) * t_color.w;
#ifdef BLEND_OPAQUE
    if(_clip >= alpha) {
        discard;
    }
    vec3 norm   = vec3(1.0);
    vec3 matv   = vec3(0.0, 0.0, getMetallic( params ));
    float rough = 0.0;
    float model = 0.0;
    #ifdef MODEL_LIT
    model       = 0.34;
    norm        = 0.5 * params.normal + vec3( 0.5 );
    rough       = max(0.08, getRoughness( params ));
    emit        = emit + albd * light.ambient;
    #endif
    gbuffer1    = vec4( norm, model );
    gbuffer2    = vec4( albd, rough );
    gbuffer3    = vec4( matv, 1.0   );
    gbuffer4    = vec4( emit, 0.0   );
#else
    gbuffer1    = vec4( emit, alpha );
#endif
}

void main(void) {
    params.uv       = _uv0;
    params.project  = _proj;
    params.reflect  = vec3(0.0);
    params.color    = _color;
    params.normal   = _n;
#ifdef TANGENT
    params.normal   = 2.0 * getNormal( params ) - vec3( 1.0 );
    params.normal   = normalize( params.normal.x * _t + params.normal.y * _b + params.normal.z * _n );
#endif
    params.reflect  = reflect( _view, params.normal );
#ifdef SIMPLE
    #ifdef DEPTH
    depthMode(params);
    #else
    simpleMode(params);
    #endif
#else
    passMode(params);
#endif
}
