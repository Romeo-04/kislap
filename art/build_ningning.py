# Builds Ningning in 3D and renders the six mood images used by the app (issue #9).
# Run in Blender 5.x: blender --background --python art/build_ningning.py
# Shapes follow the Claude Design SVG (public/mascot/ningning-*.svg): 54 SVG units = 1 m,
# an orthographic front camera frames the same 200 x 200 box, so the app's live glow halo lines up.
# Output: public/mascot/ningning-<mood>.webp, 640 x 640, transparent.
import bpy, bmesh, math, os
from mathutils import Vector

S = 54.0
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'mascot')
MOODS = ('idle', 'listening', 'thinking', 'cheering', 'encouraging', 'celebrating')
PX = 0.0185  # one display pixel in metres at 200 px


def srgb(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return (*[x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c], 1.0)


def X(x): return (x - 100) / S
def Z(y): return -(y - 96) / S


def flat(name, hexcol, alpha=1.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial'); em = nt.nodes.new('ShaderNodeEmission')
    em.inputs[0].default_value = srgb(hexcol)
    if alpha < 1:
        tr = nt.nodes.new('ShaderNodeBsdfTransparent'); mix = nt.nodes.new('ShaderNodeMixShader')
        mix.inputs[0].default_value = alpha
        nt.links.new(tr.outputs[0], mix.inputs[1]); nt.links.new(em.outputs[0], mix.inputs[2]); nt.links.new(mix.outputs[0], out.inputs[0])
        m.surface_render_method = 'BLENDED'
    else:
        nt.links.new(em.outputs[0], out.inputs[0])
    return m


def toon(name, light, dark):
    # two flat tones: lit and shade, split by a constant colour ramp
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial'); dif = nt.nodes.new('ShaderNodeBsdfDiffuse')
    s2r = nt.nodes.new('ShaderNodeShaderToRGB'); ramp = nt.nodes.new('ShaderNodeValToRGB'); em = nt.nodes.new('ShaderNodeEmission')
    ramp.color_ramp.interpolation = 'CONSTANT'
    ramp.color_ramp.elements[0].color = dark; ramp.color_ramp.elements[1].position = 0.18; ramp.color_ramp.elements[1].color = light
    nt.links.new(dif.outputs[0], s2r.inputs[0]); nt.links.new(s2r.outputs[0], ramp.inputs[0])
    nt.links.new(ramp.outputs[0], em.inputs[0]); nt.links.new(em.outputs[0], out.inputs[0])
    return m


def toon_hex(name, hexcol, shade=0.8):
    b = srgb(hexcol); return toon(name, b, (b[0] * shade, b[1] * shade, b[2] * shade, 1))


def reset_scene():
    for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
    sc = bpy.context.scene
    # the toon shading (Shader to RGB, blended alpha) only works in EEVEE; startup files may pick Cycles
    for engine in ('BLENDER_EEVEE', 'BLENDER_EEVEE_NEXT'):
        try:
            sc.render.engine = engine; break
        except TypeError:
            pass
    sc.view_settings.view_transform = 'Standard'
    sc.render.film_transparent = True
    sc.render.resolution_x = sc.render.resolution_y = 640
    sc.render.image_settings.file_format = 'WEBP'
    sc.render.image_settings.color_mode = 'RGBA'
    sc.render.image_settings.quality = 88
    cam = bpy.data.objects.new('Camera', bpy.data.cameras.new('cam'))
    cam.data.type = 'ORTHO'; cam.data.ortho_scale = 200 / S
    cam.location = (0, -10, Z(100)); cam.rotation_euler = (math.radians(90), 0, 0)
    sc.collection.objects.link(cam); sc.camera = cam
    sun = bpy.data.objects.new('Sun', bpy.data.lights.new('sun', 'SUN')); sun.data.energy = 3
    sun.rotation_euler = (math.radians(55), math.radians(-30), math.radians(-25))
    sc.collection.objects.link(sun)


M = {}


def materials():
    M['ink'] = flat('ink', '#1E2B1F'); M['ink'].use_backface_culling = True  # inverted-hull outline
    M['ink_solid'] = flat('ink_solid', '#1E2B1F')
    M['green'] = toon_hex('green', '#7CC35A'); M['orange'] = toon_hex('orange', '#F07F2A')
    M['yellow'] = toon_hex('yellow', '#FFC62E', 0.86); M['pale'] = flat('pale', '#FFF3B8')
    M['cheek'] = flat('cheek', '#F07F2A', 0.55); M['white'] = flat('white', '#FFFFFF')
    M['tongue'] = flat('tongue', '#F07F2A'); M['wing'] = toon('wing', srgb('#FFFFFF'), srgb('#E6ECE4'))


def link(o, c): c.objects.link(o); return o


def outline(o, px):
    o.data.materials.append(M['ink'])
    m = o.modifiers.new('outline', 'SOLIDIFY'); m.thickness = -px * PX; m.use_flip_normals = True
    m.material_offset = len(o.data.materials) - 1


def blob(name, loc, size, mat, c, normal=None, outline_px=0.0, seg=32):
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=seg // 2, radius=1.0)
    bmesh.ops.scale(bm, vec=size, verts=bm.verts)  # baked, so the outline keeps one width
    bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = True
    o = link(bpy.data.objects.new(name, me), c); o.location = loc
    if normal is not None:
        o.rotation_mode = 'QUATERNION'; o.rotation_quaternion = (-normal).to_track_quat('Y', 'Z')
    me.materials.append(mat)
    if outline_px: outline(o, outline_px)
    return o


def surf(x, y, lift=0.012):
    """SVG point projected onto the front of the body, nudged out along the normal."""
    xx, zz = X(x), Z(y)
    yy = -0.92 * math.sqrt(max(0.0, 1 - xx * xx - zz * zz))
    n = Vector((xx, yy / (0.92 * 0.92), zz)).normalized()
    return Vector((xx, yy, zz)) + n * lift, n


def quad(p0, p1, p2, n=24):
    return [((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
             (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]) for t in [i / n for i in range(n + 1)]]


def stroke(name, pts, px, c, mat=None):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'
    cu.bevel_depth = px * PX / 2; cu.bevel_resolution = 4; cu.use_fill_caps = True
    sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
    for p, q in zip(sp.points, pts): p.co = (q[0], q[1], q[2], 1)
    cu.materials.append(mat or M['ink_solid'])
    return link(bpy.data.objects.new(name, cu), c)


def face_stroke(name, svg_pts, px, c, lift=0.02):
    return stroke(name, [surf(x, y, lift)[0] for x, y in svg_pts], px, c)


def face_disc(name, x, y, rx, ry, mat, c, depth=0.035, lift=0.015, outline_px=0.0):
    p, n = surf(x, y, lift)
    return blob(name, p, (rx / S, depth, ry / S), mat, c, n, outline_px)


def build_fixed():
    c = bpy.context.scene.collection
    body = blob('body', Vector((0, 0, 0)), (1, 0.92, 1), M['green'], c, outline_px=4, seg=64)
    tail = blob('tail', Vector((0, 0.35, Z(150))), (36 / S, 0.45, 28 / S), M['yellow'], c, outline_px=4, seg=48)
    blob('tail_spot', Vector((X(88), -0.1, Z(158))), (10 / S, 0.05, 6 / S), M['pale'], c)
    # cap: a band laid on the head between the SVG cap's two edges (Q-curves, mid y 50 and 67)
    half = 44 / S
    def edge(x, mid_y):
        t = max(0.0, 1 - (x / half) ** 2); return Z(74 + (mid_y - 74) * t)
    R, NU, NV = 1.015, 64, 12
    verts = []
    for i in range(NU + 1):
        x = -half + 2 * half * i / NU; lo, hi = edge(x, 67), edge(x, 50)
        for j in range(NV + 1):
            z = lo + (hi - lo) * j / NV
            verts.append((x, -0.94 * math.sqrt(max(0.0, R * R - x * x - z * z)), z))
    faces = [(i * (NV + 1) + j, (i + 1) * (NV + 1) + j, (i + 1) * (NV + 1) + j + 1, i * (NV + 1) + j + 1) for i in range(NU) for j in range(NV)]
    me = bpy.data.meshes.new('cap'); me.from_pydata(verts, [], faces); me.update()
    for p in me.polygons: p.use_smooth = True
    cap = link(bpy.data.objects.new('cap', me), c); me.materials.append(M['orange']); me.materials.append(M['ink'])
    t = cap.modifiers.new('thick', 'SOLIDIFY'); t.thickness = 0.05; t.offset = -1
    o = cap.modifiers.new('outline', 'SOLIDIFY'); o.thickness = 0.055; o.offset = 1; o.use_flip_normals = True; o.material_offset = 1
    for nm, mid in (('cap_edge_lo', 67), ('cap_edge_hi', 50)):
        pts = []
        for i in range(41):
            x = -half + 2 * half * i / 40; z = edge(x, mid)
            y = -0.954 * math.sqrt(max(0.0, 1.015 ** 2 - x * x - z * z))
            pts.append(Vector((x, y, z)) + Vector((x, y, z)).normalized() * 0.02)
        stroke(nm, pts, 3, c)
    for x in (68, 132):
        p, n = surf(x, 112, 0.01)
        blob(f'cheek_{x}', p, (8 / S, 0.01, 5 / S), M['cheek'], c, n, seg=24)


def build_mood(mood):
    c = bpy.data.collections.get('mood')
    if c:
        for o in list(c.objects): bpy.data.objects.remove(o, do_unlink=True)
    else:
        c = bpy.data.collections.new('mood'); bpy.context.scene.collection.children.link(c)
    spread = mood == 'celebrating'
    for side in (-1, 1):  # wings behind the body, leaning outward
        cx, cy = (60, 70) if spread else (66, 72)
        x = cx if side < 0 else 200 - cx
        w = blob(f'wing_{side}', Vector((X(x), 0.35, Z(cy))), (24 / S, 0.12, (38 if spread else 36) / S), M['wing'], c, outline_px=4)
        w.rotation_euler = (0, math.radians(55 if spread else 35) * side, 0)
    for side in (-1, 1):  # antennae: straight while listening, curled out otherwise
        if mood == 'listening':
            pts = [(88 - 4 * t / 12, 48 - 36 * t / 12) for t in range(13)]; tip = (84, 10)
        else:
            pts = quad((86, 48), (80, 28), (70, 18)); tip = (69, 16)
        if side > 0: pts = [(200 - x, y) for x, y in pts]; tip = (200 - tip[0], tip[1])
        stroke(f'antenna_{side}', [Vector((X(x), -0.15, Z(y))) for x, y in pts], 4, c)
        blob(f'antenna_tip_{side}', Vector((X(tip[0]), -0.15, Z(tip[1]))), (7 / S,) * 3, M['yellow'], c, outline_px=3)
    if mood in ('cheering', 'celebrating'):
        face_stroke('eye_l', quad((71, 96), (82, 83), (93, 96)), 5, c)
        face_stroke('eye_r', quad((107, 96), (118, 83), (129, 96)), 5, c)
    else:
        dx, dy = {'listening': (1, -6), 'thinking': (-4, -7)}.get(mood, (0, 0))
        enc = mood == 'encouraging'
        ey, ry = (95, 12) if enc else (94, 13)
        for nm, ex in (('l', 82), ('r', 118)):
            face_disc(f'eye_{nm}', ex, ey, 11, ry, M['white'], c, outline_px=3)
            face_disc(f'pupil_{nm}', ex + 1 + dx + (1 if enc else 0), 97 + dy, 6, 6, M['ink_solid'], c, depth=0.02, lift=0.05)
            if mood != 'thinking':
                face_disc(f'shine_{nm}', ex + 3 + dx + (1 if enc else 0), 94 + dy, 2, 2, M['white'], c, depth=0.01, lift=0.075)
        if enc:
            face_stroke('brow_l', quad((72, 76), (82, 71), (92, 76)), 4, c)
            face_stroke('brow_r', quad((108, 76), (118, 71), (128, 76)), 4, c)
        if mood == 'thinking':
            face_stroke('brow_r', quad((108, 74), (118, 68), (128, 74)), 4, c)
    if mood == 'listening':
        face_disc('mouth', 100, 117, 5, 6, M['ink_solid'], c, depth=0.02, lift=0.02)
    elif mood == 'thinking':
        face_stroke('mouth', quad((92, 117), (96, 113), (100, 117), 8) + quad((100, 117), (104, 121), (108, 117), 8)[1:], 4, c)
    elif mood in ('cheering', 'celebrating'):
        poly = quad((84, 111), (100, 138), (116, 111), 24)
        me = bpy.data.meshes.new('mouth'); vs = [surf(x, y, 0.03)[0] for x, y in poly]
        me.from_pydata(vs, [], [list(range(len(vs)))]); me.update(); me.materials.append(M['ink_solid'])
        link(bpy.data.objects.new('mouth', me), c)
        face_stroke('mouth_edge', poly + [(84, 111)], 3, c)
        face_disc('tongue', 100, 124, 7, 4, M['tongue'], c, depth=0.01, lift=0.04)
    elif mood == 'encouraging':
        face_stroke('mouth', quad((86, 113), (100, 127), (114, 113)), 4, c)
    else:
        face_stroke('mouth', quad((90, 114), (100, 123), (110, 114)), 4, c)
    if mood == 'thinking':
        for i, (x, y, r) in enumerate(((152, 44, 4), (164, 30, 6), (180, 13, 8))):
            blob(f'thought_{i}', Vector((X(x), -0.8, Z(y))), (r / S,) * 3, M['white'], c, outline_px=3)


if __name__ == '__main__':
    reset_scene(); materials(); build_fixed()
    os.makedirs(OUT, exist_ok=True)
    for mood in MOODS:
        build_mood(mood)
        bpy.context.scene.render.filepath = os.path.join(OUT, f'ningning-{mood}.webp')
        bpy.ops.render.render(write_still=True)
